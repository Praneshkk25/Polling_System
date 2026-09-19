package controllers

import (
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode"

	"livepoll-backend/config"
	"livepoll-backend/database"
	"livepoll-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

func validateEmail(email string) error {
	trimmed := strings.TrimSpace(email)
	if trimmed == "" {
		return errors.New("Email address is required")
	}
	if len(trimmed) > 254 {
		return errors.New("Email address cannot exceed 254 characters")
	}
	if strings.Contains(trimmed, " ") {
		return errors.New("Email address cannot contain spaces")
	}
	if strings.Contains(trimmed, "..") {
		return errors.New("Please enter a valid email address (e.g. name@example.com)")
	}
	parts := strings.Split(trimmed, "@")
	if len(parts) != 2 {
		return errors.New("Please enter a valid email address (e.g. name@example.com)")
	}
	local, domain := parts[0], parts[1]
	if local == "" || domain == "" {
		return errors.New("Please enter a valid email address (e.g. name@example.com)")
	}
	if strings.HasPrefix(local, ".") || strings.HasSuffix(local, ".") || strings.HasPrefix(domain, ".") || strings.HasSuffix(domain, ".") {
		return errors.New("Please enter a valid email address (e.g. name@example.com)")
	}
	if !emailRegex.MatchString(trimmed) {
		return errors.New("Please enter a valid email address (e.g. name@example.com)")
	}
	return nil
}

func validatePasswordComplexity(password string) error {
	if len(password) < 8 {
		return errors.New("Password must be at least 8 characters long")
	}
	if len(password) > 100 {
		return errors.New("Password cannot exceed 100 characters")
	}

	var hasUpper, hasLower, hasNumber, hasSpecial bool
	for _, ch := range password {
		switch {
		case unicode.IsUpper(ch):
			hasUpper = true
		case unicode.IsLower(ch):
			hasLower = true
		case unicode.IsDigit(ch):
			hasNumber = true
		case unicode.IsPunct(ch) || unicode.IsSymbol(ch):
			hasSpecial = true
		}
	}

	if !hasUpper {
		return errors.New("Password must contain at least one uppercase letter (A-Z)")
	}
	if !hasLower {
		return errors.New("Password must contain at least one lowercase letter (a-z)")
	}
	if !hasNumber {
		return errors.New("Password must contain at least one number (0-9)")
	}
	if !hasSpecial {
		return errors.New("Password must contain at least one special character (!@#$%^&*...)")
	}

	return nil
}

func formatBindingError(err error) string {
	var ve validator.ValidationErrors
	if errors.As(err, &ve) {
		for _, fe := range ve {
			switch fe.Field() {
			case "Email":
				return "Please enter a valid email address (e.g. name@example.com)"
			case "Password":
				if fe.Tag() == "min" {
					return "Password must be at least 8 characters long"
				}
				return "Password is required"
			case "NewPassword":
				if fe.Tag() == "min" {
					return "New password must be at least 8 characters long"
				}
				return "New password is required"
			case "OldPassword":
				return "Current password is required"
			case "Name":
				return "Name must be between 2 and 60 characters"
			}
		}
	}
	return "Validation failed: " + err.Error()
}

type AuthController struct {
	store database.Store
	cfg   *config.Config
}

func NewAuthController(store database.Store, cfg *config.Config) *AuthController {
	return &AuthController{
		store: store,
		cfg:   cfg,
	}
}

func (ac *AuthController) generateToken(user *models.User) (string, error) {
	claims := &models.JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Name:   user.Name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(14 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(ac.cfg.JWTSecret))
}

func (ac *AuthController) Signup(c *gin.Context) {
	var input models.SignupInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": formatBindingError(err)})
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	input.Name = strings.TrimSpace(input.Name)

	if err := validateEmail(input.Email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := validatePasswordComplexity(input.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if _, err := ac.store.GetUserByEmail(input.Email); err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "An account with this email already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encrypt password"})
		return
	}

	user := &models.User{
		Name:      input.Name,
		Email:     input.Email,
		Password:  string(hashedPassword),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := ac.store.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user account"})
		return
	}

	token, err := ac.generateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate authentication token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token: token,
		User: models.UserResponse{
			ID:         user.ID,
			Name:       user.Name,
			Email:      user.Email,
			CreatedAt:  user.CreatedAt,
			TotalPolls: 0,
			TotalVotes: 0,
			TotalViews: 0,
		},
	})
}

func (ac *AuthController) Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": formatBindingError(err)})
		return
	}

	input.Email = strings.TrimSpace(strings.ToLower(input.Email))
	if err := validateEmail(input.Email); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ac.store.GetUserByEmail(input.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := ac.generateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	totalPolls, totalVotes, totalViews, _ := ac.store.GetUserStats(user.ID)

	c.JSON(http.StatusOK, models.AuthResponse{
		Token: token,
		User: models.UserResponse{
			ID:         user.ID,
			Name:       user.Name,
			Email:      user.Email,
			CreatedAt:  user.CreatedAt,
			TotalPolls: totalPolls,
			TotalVotes: totalVotes,
			TotalViews: totalViews,
		},
	})
}

func (ac *AuthController) Me(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := ac.store.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	totalPolls, totalVotes, totalViews, _ := ac.store.GetUserStats(user.ID)

	c.JSON(http.StatusOK, models.UserResponse{
		ID:         user.ID,
		Name:       user.Name,
		Email:      user.Email,
		CreatedAt:  user.CreatedAt,
		TotalPolls: totalPolls,
		TotalVotes: totalVotes,
		TotalViews: totalViews,
	})
}

func (ac *AuthController) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.UpdateProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": formatBindingError(err)})
		return
	}

	input.Name = strings.TrimSpace(input.Name)
	if len(input.Name) < 2 || len(input.Name) > 60 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be between 2 and 60 characters"})
		return
	}

	if err := ac.store.UpdateUserProfile(userID.(string), input.Name); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully", "name": input.Name})
}

func (ac *AuthController) ChangePassword(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var input models.ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": formatBindingError(err)})
		return
	}

	if input.OldPassword == input.NewPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password must be different from current password"})
		return
	}

	if err := validatePasswordComplexity(input.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := ac.store.GetUserByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	if err := ac.store.UpdateUserPassword(userID.(string), string(hashed)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password changed successfully"})
}

func (ac *AuthController) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
