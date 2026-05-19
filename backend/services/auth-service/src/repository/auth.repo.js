import { supabaseUsers, supabaseAdmin } from "../config/database/supabase.config.js";

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
        const signUpOptions = {
            data: {
                role: "user",
            },
        };
        if (emailRedirectTo) {
            signUpOptions.emailRedirectTo = emailRedirectTo;
        }

        const { data, error } = await supabaseUsers.auth.signUp({
            email,
            password,
            options: signUpOptions,
        });

        if (error) {
            throw new Error(error.message);
        }

        await upsertProfileOnSignup(email);
        return data;
    }

    async signIn(email, password) {
        const { data, error } = await supabaseUsers.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async signUpAsAdmin(email, password) {
        const { data, error } = await supabaseUsers.auth.signUp({
            email,
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

        await upsertProfileOnSignup(email);
        return data;
    }

    async forgotPassword(email, redirectTo) {
        const options = redirectTo ? { redirectTo } : undefined;
        const { data, error } = await supabaseUsers.auth.resetPasswordForEmail(email, options);

        if (error) {
            throw new Error(error.message);
        }

        const isVerified = Boolean(
            data?.user?.email_confirmed_at ||
            data?.user?.confirmed_at
        );
        if (!isVerified) {
            throw new Error("Email is not verified. Please verify your email before signing in.");
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
