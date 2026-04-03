// types/auth.dto.ts
export interface SignInRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        otpHash: string;
        otpExpiresAt: string;
        isVerified: boolean;
        role: string;
        organization: string;
        resetPasswordToken: string | null;
        resetPasswordExpires: string | null;
        createdAt: string;
        updatedAt: string;
    };
}