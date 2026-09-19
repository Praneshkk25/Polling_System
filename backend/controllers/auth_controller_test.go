package controllers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"livepoll-backend/config"
	"livepoll-backend/database"
	"livepoll-backend/models"

	"github.com/gin-gonic/gin"
)

func setupAuthTestRouter() (*gin.Engine, *AuthController) {
	gin.SetMode(gin.TestMode)
	store := database.NewMemoryStore()
	cfg := &config.Config{
		JWTSecret: "test-secret-key-1234567890",
	}
	authCtrl := NewAuthController(store, cfg)

	r := gin.New()
	r.POST("/api/auth/signup", authCtrl.Signup)
	r.POST("/api/auth/login", authCtrl.Login)
	r.PUT("/api/auth/password", func(c *gin.Context) {
		c.Set("userId", "test-user-id")
		authCtrl.ChangePassword(c)
	})

	return r, authCtrl
}

func TestEmailValidation(t *testing.T) {
	invalidEmails := []string{
		"plainaddress",
		"@missingusername.com",
		"username@.com",
		"username@domain..com",
		"user name@domain.com",
		"user@domain",
		"",
	}

	for _, email := range invalidEmails {
		err := validateEmail(email)
		if err == nil {
			t.Errorf("expected validateEmail(%q) to fail, but got nil", email)
		}
	}

	validEmails := []string{
		"user@domain.com",
		"test.user+filter@example.co.uk",
		"pranesh@pulsepoll.io",
	}

	for _, email := range validEmails {
		err := validateEmail(email)
		if err != nil {
			t.Errorf("expected validateEmail(%q) to succeed, but got: %v", email, err)
		}
	}
}

func TestPasswordComplexityValidation(t *testing.T) {
	testCases := []struct {
		password string
		valid    bool
		desc     string
	}{
		{"Short1!", false, "Too short (< 8 chars)"},
		{"alllowercase123!", false, "Missing uppercase"},
		{"ALLUPPERCASE123!", false, "Missing lowercase"},
		{"NoDigitsHere!@#", false, "Missing digits"},
		{"NoSpecialChar123", false, "Missing special character"},
		{"Password123!", true, "Valid strong password"},
		{"Complex#2026Secure", true, "Valid strong password"},
	}

	for _, tc := range testCases {
		err := validatePasswordComplexity(tc.password)
		if tc.valid && err != nil {
			t.Errorf("[%s] Expected valid for %q, got error: %v", tc.desc, tc.password, err)
		}
		if !tc.valid && err == nil {
			t.Errorf("[%s] Expected error for %q, got nil", tc.desc, tc.password)
		}
	}
}

func TestSignupValidationAPIErrors(t *testing.T) {
	r, _ := setupAuthTestRouter()

	// 1. Invalid email
	payload, _ := json.Marshal(models.SignupInput{
		Name:     "Test User",
		Email:    "invalid-email-address",
		Password: "Password123!",
	})
	req, _ := http.NewRequest("POST", "/api/auth/signup", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for invalid email, got %d", w.Code)
	}

	// 2. Weak password (missing symbol)
	payload, _ = json.Marshal(models.SignupInput{
		Name:     "Test User",
		Email:    "valid@pulsepoll.io",
		Password: "Weakpassword1",
	})
	req, _ = http.NewRequest("POST", "/api/auth/signup", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for weak password, got %d", w.Code)
	}

	// 3. Valid Signup
	payload, _ = json.Marshal(models.SignupInput{
		Name:     "Valid Creator",
		Email:    "newcreator@pulsepoll.io",
		Password: "Password123!",
	})
	req, _ = http.NewRequest("POST", "/api/auth/signup", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	r.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201 for valid signup, got %d: %s", w.Code, w.Body.String())
	}

	// 4. Duplicate Signup returns 409
	reqDuplicate, _ := http.NewRequest("POST", "/api/auth/signup", bytes.NewBuffer(payload))
	reqDuplicate.Header.Set("Content-Type", "application/json")
	wDup := httptest.NewRecorder()
	r.ServeHTTP(wDup, reqDuplicate)

	if wDup.Code != http.StatusConflict {
		t.Fatalf("expected status 409 for duplicate email signup, got %d", wDup.Code)
	}
}
