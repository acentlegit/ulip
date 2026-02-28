const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const { generateToken, authenticate } = require("../middleware/auth");
const auditLog = require("../middleware/audit");
const { UserRoles, getAllRoles } = require("../constants/roles");

let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    errorFormat: "pretty"
  });
} catch (error) {
  console.error("Failed to initialize Prisma Client in auth routes:", error);
  throw error;
}

// Register / Signup
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, organizationName, role = UserRoles.ORG_ADMIN } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Validate role
    const validRoles = getAllRoles();
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: "Invalid role", 
        validRoles: validRoles 
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create organization and user
    const organization = await prisma.organization.create({
      data: {
        name: organizationName || `${name}'s Organization`,
        users: {
          create: {
            email,
            password: hashedPassword,
            name,
            role
          }
        }
      },
      include: { users: true }
    });

    const user = organization.users[0];
    const token = generateToken(user);

    try {
      await auditLog(req, "REGISTER", "USER", user.id, { email, role });
    } catch (auditError) {
      console.error("Audit log error (non-critical):", auditError);
    }

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organization: {
          id: organization.id,
          name: organization.name
        }
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    // Return more detailed error for debugging
    const errorMessage = error.message || "Registration failed";
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validate role (required for security - ensures user is logging into correct account)
    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }
    
    if (user.role !== role) {
      return res.status(401).json({ 
        error: "Account type mismatch. Please select the correct role for this account." 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateToken(user);
    
    try {
      await auditLog(req, "LOGIN", "USER", user.id);
    } catch (auditError) {
      console.error("Audit log error (non-critical):", auditError);
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      error: "Login failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        phone: true,
        twoFactorEnabled: true,
        emailVerified: true,
        lastLogin: true,
        organization: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true
          }
        }
      }
    });

    if (!user) {
      console.error("User not found for ID:", req.user.id);
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    console.error("Error stack:", error.stack);
    console.error("User ID from request:", req.user?.id);
    res.status(500).json({ 
      error: "Failed to get user",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ message: "If user exists, password reset email sent" });
    }

    // In production, send email with reset token
    // For now, just return success
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    // In production, verify token from email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    try {
      await auditLog(req, "PASSWORD_RESET", "USER", user.id);
    } catch (auditError) {
      console.error("Audit log error (non-critical):", auditError);
    }

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Change Password
router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    try {
      await auditLog(req, "PASSWORD_CHANGE", "USER", user.id);
    } catch (auditError) {
      console.error("Audit log error (non-critical):", auditError);
    }

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Get all available roles (public endpoint for UI)
router.get("/roles", (req, res) => {
  try {
    const { UserRoles, RoleDisplayNames, RoleDescriptions, getAllRoles } = require("../constants/roles");
    
    const roles = getAllRoles().map(role => ({
      value: role,
      label: RoleDisplayNames[role],
      description: RoleDescriptions[role]
    }));

    res.json({
      roles,
      allRoles: UserRoles
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

// Helper function to exchange Google OAuth code for user info
async function exchangeGoogleCode(code, provider) {
  const https = require("https");
  const querystring = require("querystring");
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const callbackUrl = `${backendUrl}/api/auth/sso/${provider}/callback`;
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth not configured");
  }
  
  // Exchange authorization code for access token
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code"
    });
    
    const options = {
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const tokenResponse = JSON.parse(data);
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }
          
          const accessToken = tokenResponse.access_token;
          
          // Get user info from Google
          const userInfoOptions = {
            hostname: "www.googleapis.com",
            path: "/oauth2/v2/userinfo",
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          };
          
          const userInfoReq = https.request(userInfoOptions, (userInfoRes) => {
            let userData = "";
            userInfoRes.on("data", (chunk) => { userData += chunk; });
            userInfoRes.on("end", () => {
              try {
                const userInfo = JSON.parse(userData);
                resolve({
                  email: userInfo.email,
                  name: userInfo.name || userInfo.given_name + " " + userInfo.family_name,
                  picture: userInfo.picture
                });
              } catch (err) {
                reject(new Error("Failed to parse user info: " + err.message));
              }
            });
          });
          
          userInfoReq.on("error", (err) => {
            reject(new Error("Failed to get user info: " + err.message));
          });
          
          userInfoReq.end();
        } catch (err) {
          reject(new Error("Failed to parse token response: " + err.message));
        }
      });
    });
    
    req.on("error", (err) => {
      reject(new Error("Failed to exchange code: " + err.message));
    });
    
    req.write(postData);
    req.end();
  });
}

// Helper function to exchange Microsoft OAuth code for user info
async function exchangeMicrosoftCode(code, provider) {
  const https = require("https");
  const querystring = require("querystring");
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const callbackUrl = `${backendUrl}/api/auth/sso/${provider}/callback`;
  
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const tenant = process.env.MICROSOFT_TENANT_ID || "common";
  
  if (!clientId || !clientSecret) {
    throw new Error("Microsoft OAuth not configured");
  }
  
  // Exchange authorization code for access token
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      client_id: clientId,
      scope: "openid email profile",
      code: code,
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
      client_secret: clientSecret
    });
    
    const options = {
      hostname: "login.microsoftonline.com",
      path: `/${tenant}/oauth2/v2.0/token`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length
      }
    };
    
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const tokenResponse = JSON.parse(data);
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }
          
          const accessToken = tokenResponse.access_token;
          
          // Get user info from Microsoft Graph
          const userInfoOptions = {
            hostname: "graph.microsoft.com",
            path: "/v1.0/me",
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          };
          
          const userInfoReq = https.request(userInfoOptions, (userInfoRes) => {
            let userData = "";
            userInfoRes.on("data", (chunk) => { userData += chunk; });
            userInfoRes.on("end", () => {
              try {
                const userInfo = JSON.parse(userData);
                resolve({
                  email: userInfo.mail || userInfo.userPrincipalName,
                  name: userInfo.displayName || userInfo.givenName + " " + userInfo.surname,
                  picture: null
                });
              } catch (err) {
                reject(new Error("Failed to parse user info: " + err.message));
              }
            });
          });
          
          userInfoReq.on("error", (err) => {
            reject(new Error("Failed to get user info: " + err.message));
          });
          
          userInfoReq.end();
        } catch (err) {
          reject(new Error("Failed to parse token response: " + err.message));
        }
      });
    });
    
    req.on("error", (err) => {
      reject(new Error("Failed to exchange code: " + err.message));
    });
    
    req.write(postData);
    req.end();
  });
}

// Helper function to exchange Okta OAuth code for user info
async function exchangeOktaCode(code, provider) {
  const https = require("https");
  const querystring = require("querystring");
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const callbackUrl = `${backendUrl}/api/auth/sso/${provider}/callback`;
  
  const oktaDomain = process.env.OKTA_DOMAIN;
  const clientId = process.env.OKTA_CLIENT_ID;
  const clientSecret = process.env.OKTA_CLIENT_SECRET;
  
  if (!oktaDomain || !clientId || !clientSecret) {
    throw new Error("Okta OAuth not configured");
  }
  
  // Exchange authorization code for access token
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: callbackUrl,
      client_id: clientId,
      client_secret: clientSecret
    });
    
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const options = {
      hostname: oktaDomain.replace(/^https?:\/\//, ""),
      path: "/oauth2/v1/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length,
        "Authorization": `Basic ${authString}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const tokenResponse = JSON.parse(data);
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }
          
          const accessToken = tokenResponse.access_token;
          
          // Get user info from Okta
          const userInfoOptions = {
            hostname: oktaDomain.replace(/^https?:\/\//, ""),
            path: "/oauth2/v1/userinfo",
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`
            }
          };
          
          const userInfoReq = https.request(userInfoOptions, (userInfoRes) => {
            let userData = "";
            userInfoRes.on("data", (chunk) => { userData += chunk; });
            userInfoRes.on("end", () => {
              try {
                const userInfo = JSON.parse(userData);
                resolve({
                  email: userInfo.email,
                  name: userInfo.name || userInfo.given_name + " " + userInfo.family_name,
                  picture: userInfo.picture
                });
              } catch (err) {
                reject(new Error("Failed to parse user info: " + err.message));
              }
            });
          });
          
          userInfoReq.on("error", (err) => {
            reject(new Error("Failed to get user info: " + err.message));
          });
          
          userInfoReq.end();
        } catch (err) {
          reject(new Error("Failed to parse token response: " + err.message));
        }
      });
    });
    
    req.on("error", (err) => {
      reject(new Error("Failed to exchange code: " + err.message));
    });
    
    req.write(postData);
    req.end();
  });
}

// SSO OAuth Initiation - Generate OAuth URL and redirect
router.get("/sso/:provider", (req, res) => {
  try {
    const { provider } = req.params;
    const { role } = req.query; // Get role from query parameter
    
    // Validate role if provided
    if (role) {
      const validRoles = getAllRoles();
      if (!validRoles.includes(role)) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Invalid role selected")}`);
      }
    }
    
    // Generate state token for CSRF protection
    const state = require("crypto").randomBytes(32).toString("hex");
    
    // Store state temporarily with role (in production, use Redis or session)
    if (!global.oauthStates) {
      global.oauthStates = new Map();
    }
    global.oauthStates.set(state, { 
      provider, 
      role: role || null, // Store role for later use
      timestamp: Date.now() 
    });
    
    let authUrl;
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const callbackUrl = `${backendUrl}/api/auth/sso/${provider}/callback`;
    
    switch (provider.toLowerCase()) {
      case "google":
        // Real Google OAuth URL - redirects to Google's login page
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          return res.status(400).json({ 
            error: "Google OAuth not configured",
            message: "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file",
            setupUrl: "https://console.cloud.google.com/apis/credentials"
          });
        }
        
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${googleClientId}&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `response_type=code&` +
          `scope=openid%20email%20profile&` +
          `state=${state}&` +
          `access_type=online&` +
          `prompt=select_account`;
        break;
        
      case "microsoft":
        // Real Microsoft OAuth URL
        const msClientId = process.env.MICROSOFT_CLIENT_ID;
        if (!msClientId) {
          return res.status(400).json({ 
            error: "Microsoft OAuth not configured",
            message: "Please set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in your .env file"
          });
        }
        const msTenant = process.env.MICROSOFT_TENANT_ID || "common";
        authUrl = `https://login.microsoftonline.com/${msTenant}/oauth2/v2.0/authorize?` +
          `client_id=${msClientId}&` +
          `response_type=code&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `response_mode=query&` +
          `scope=openid%20email%20profile&` +
          `state=${state}`;
        break;
        
      case "okta":
        // Real Okta OAuth URL
        const oktaDomain = process.env.OKTA_DOMAIN;
        const oktaClientId = process.env.OKTA_CLIENT_ID;
        if (!oktaDomain || !oktaClientId) {
          return res.status(400).json({ 
            error: "Okta OAuth not configured",
            message: "Please set OKTA_DOMAIN and OKTA_CLIENT_ID in your .env file"
          });
        }
        authUrl = `https://${oktaDomain}/oauth2/v1/authorize?` +
          `client_id=${oktaClientId}&` +
          `response_type=code&` +
          `scope=openid%20email%20profile&` +
          `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
          `state=${state}`;
        break;
        
      default:
        return res.status(400).json({ error: "Invalid SSO provider" });
    }
    
    // Clean up old states (older than 10 minutes)
    setTimeout(() => {
      if (global.oauthStates) {
        for (const [key, value] of global.oauthStates.entries()) {
          if (Date.now() - value.timestamp > 600000) {
            global.oauthStates.delete(key);
          }
        }
      }
    }, 600000);
    
    // Redirect directly to OAuth provider (like Shopify example)
    res.redirect(authUrl);
  } catch (error) {
    console.error("SSO initiation error:", error);
    res.status(500).json({ error: "Failed to initiate SSO" });
  }
});

// SSO OAuth Callback - Handle OAuth response
router.get("/sso/:provider/callback", async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;
    
    if (error) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("No authorization code received")}`);
    }
    
    // Verify state token (CSRF protection) and get stored role
    let requestedRole = null;
    if (global.oauthStates && state) {
      const stateData = global.oauthStates.get(state);
      if (!stateData || stateData.provider !== provider.toLowerCase()) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Invalid state parameter")}`);
      }
      requestedRole = stateData.role; // Get role from stored state
      // Clean up used state
      global.oauthStates.delete(state);
    }
    
    let userInfo;
    const https = require("https");
    const querystring = require("querystring");
    
    // Exchange authorization code for tokens and get user info
    switch (provider.toLowerCase()) {
      case "google":
        userInfo = await exchangeGoogleCode(code, provider);
        break;
      case "microsoft":
        userInfo = await exchangeMicrosoftCode(code, provider);
        break;
      case "okta":
        userInfo = await exchangeOktaCode(code, provider);
        break;
      default:
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Invalid provider")}`);
    }
    
    if (!userInfo || !userInfo.email) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Failed to get user information from OAuth provider")}`);
    }
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
      include: { organization: true }
    });
    
    if (!user) {
      // Create new user from SSO with requested role (or default to ORG_ADMIN)
      const userRole = requestedRole || UserRoles.ORG_ADMIN;
      const organization = await prisma.organization.create({
        data: {
          name: `${userInfo.name}'s Organization`,
          users: {
            create: {
              email: userInfo.email,
              password: await bcrypt.hash(require("crypto").randomBytes(32).toString("hex"), 10),
              name: userInfo.name,
              role: userRole,
              emailVerified: true,
            }
          }
        },
        include: { users: true }
      });
      
      user = organization.users[0];
      user.organization = organization;
    } else {
      // Existing user - validate role if provided
      if (requestedRole && user.role !== requestedRole) {
        return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent("Account type mismatch. Please select the correct role for this account.")}`);
      }
    }
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    const token = generateToken(user);
    
    try {
      await auditLog(req, "SSO_LOGIN", "USER", user.id, { provider });
    } catch (auditError) {
      console.error("Audit log error (non-critical):", auditError);
    }
    
    // Redirect to frontend with token
    // URL encode the token to handle special characters
    const encodedToken = encodeURIComponent(token);
    res.redirect(`${frontendUrl}/auth/callback?token=${encodedToken}&provider=${provider}`);
    
  } catch (error) {
    console.error("SSO callback error:", error);
    const errorMessage = error.message || "SSO authentication failed";
    res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(errorMessage)}`);
  }
});

// SSO Token Verification (for direct token submission)
router.post("/sso/verify", async (req, res) => {
  try {
    const { provider, idToken, accessToken } = req.body;
    
    // In production, verify token with provider
    // For Google: https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=...
    // For Microsoft: https://graph.microsoft.com/v1.0/me
    // For Okta: https://{domain}/oauth2/v1/userinfo
    
    // For demo, accept and process
    let userInfo;
    
    if (idToken || accessToken) {
      // In production, decode and verify JWT token from provider
      // For demo, simulate user info
      userInfo = {
        email: `sso-${provider}@example.com`,
        name: `${provider} User`,
        provider: provider.toLowerCase()
      };
    } else {
      return res.status(400).json({ error: "Token required" });
    }
    
    // Find or create user (same logic as callback)
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
      include: { organization: true }
    });
    
    if (!user) {
      const organization = await prisma.organization.create({
        data: {
          name: `${userInfo.name}'s Organization`,
          users: {
            create: {
              email: userInfo.email,
              password: await bcrypt.hash(require("crypto").randomBytes(32).toString("hex"), 10),
              name: userInfo.name,
              role: UserRoles.ORG_ADMIN,
              emailVerified: true,
            }
          }
        },
        include: { users: true }
      });
      
      user = organization.users[0];
      user.organization = organization;
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    const token = generateToken(user);
    
    try {
      await auditLog(req, "SSO_LOGIN", "USER", user.id, { provider });
    } catch (auditError) {
      console.error("Audit log error (non-critical):", auditError);
    }
    
    res.json({
      message: `SSO authentication successful with ${provider}`,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error("SSO verify error:", error);
    res.status(500).json({ 
      error: "SSO authentication failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;
