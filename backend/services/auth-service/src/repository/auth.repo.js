import { supabaseUsers, supabaseAdmin } from "../config/database/supabase.config.js";

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

async function findAuthUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;

    let page = 1;
    const perPage = 1000;

    while (true) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) {
            throw new Error(error.message);
        }

        const users = data?.users || [];
        const matched = users.find(
            (user) => normalizeEmail(user.email) === normalizedEmail
        );
        if (matched) return matched;
        if (users.length < perPage) return null;

        page += 1;
    }
}

async function upsertProfileOnSignup(email) {
    const { error } = await supabaseAdmin
        .from("profile")
        .upsert(
            {
                email,
                name: email,
                profile_img: null,
            },
            { onConflict: "email" }
        );

    if (error) {
        throw new Error(error.message);
    }
}

export class AuthServiceRepository {
    async signUp(email, password, emailRedirectTo) {
        const normalizedEmail = normalizeEmail(email);
        const existingUser = await findAuthUserByEmail(normalizedEmail);
        if (existingUser) {
            throw new Error("Email already registered");
        }

        const signUpOptions = {
            data: {
                role: "user",
            },
        };
        if (emailRedirectTo) {
            signUpOptions.emailRedirectTo = emailRedirectTo;
        }

        const { data, error } = await supabaseUsers.auth.signUp({
            email: normalizedEmail,
            password,
            options: signUpOptions,
        });

        if (error) {
            throw new Error(error.message);
        }

        await upsertProfileOnSignup(normalizedEmail);
        return data;
    }

    async signIn(email, password) {
        const normalizedEmail = normalizeEmail(email);
        const { data, error } = await supabaseUsers.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async signUpAsAdmin(email, password) {
        const normalizedEmail = normalizeEmail(email);
        const existingUser = await findAuthUserByEmail(normalizedEmail);
        if (existingUser) {
            throw new Error("Email already registered");
        }

        const { data, error } = await supabaseUsers.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
                data: {
                    role: "admin",
                },
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        await upsertProfileOnSignup(normalizedEmail);
        return data;
    }

    async forgotPassword(email, redirectTo) {
        const options = redirectTo ? { redirectTo } : undefined;
        const { data, error } = await supabaseUsers.auth.resetPasswordForEmail(email, options);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async sendEmailOtp(email) {
        const { data, error } = await supabaseUsers.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
            },
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async verifyEmailOtp(email, token) {
        const { data, error } = await supabaseUsers.auth.verifyOtp({
            email,
            token,
            type: "email",
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async verifyEmailLink(tokenHash, type = "signup") {
        const { data, error } = await supabaseUsers.auth.verifyOtp({
            token_hash: tokenHash,
            type,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async refreshPassword(accessToken, newPassword) {
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
        if (userError || !userData?.user?.id) {
            throw new Error(userError?.message || "Invalid or expired access token");
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userData.user.id,
            { password: newPassword }
        );

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }
}
