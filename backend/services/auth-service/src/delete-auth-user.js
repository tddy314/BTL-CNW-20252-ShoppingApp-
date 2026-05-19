import { supabaseAdmin } from "./config/database/supabase.config.js";

async function findUserByEmail(email) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
    });

    if (error) {
        throw new Error(error.message);
    }

    const users = data?.users || [];
    return users.find((user) => String(user.email || "").toLowerCase() === email.toLowerCase()) || null;
}

async function deleteUserById(userId) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
        throw new Error(error.message);
    }

    console.log("Delete successful:", userId);
}

async function deleteUserByEmail(email) {
    const user = await findUserByEmail(email);
    if (!user?.id) {
        throw new Error("User not found: " + email);
    }

    await deleteUserById(user.id);
}

// Use one of these:
await deleteUserByEmail("gojousatorux123@gmail.com");
// await deleteUserById("00000000-0000-0000-0000-000000000000");
