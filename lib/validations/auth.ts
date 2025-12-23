import { z } from 'zod';

// ============================================
// LOGIN VALIDATION
// ============================================
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// REGISTRATION VALIDATION
// ============================================
export const registerStep1Schema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
});

export const registerStep2Schema = z.object({
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
    acceptTerms: z
        .boolean()
        .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must be less than 50 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
    acceptTerms: z
        .boolean()
        .refine((val) => val === true, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// FORGOT PASSWORD VALIDATION
// ============================================
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================
// HELPER FUNCTION FOR ZOD ERRORS
// ============================================
export const getZodErrors = <T extends z.ZodType>(
    schema: T,
    data: unknown
): Record<string, string> => {
    const result = schema.safeParse(data);

    if (result.success) {
        return {};
    }

    const errors: Record<string, string> = {};
    const zodErrors = result.error?.issues || [];

    zodErrors.forEach((err) => {
        const path = err.path.length > 0 ? err.path.join('.') : 'root';
        if (!errors[path]) {
            errors[path] = err.message;
        }
    });

    return errors;
};
