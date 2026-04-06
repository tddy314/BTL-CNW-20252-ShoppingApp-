import { supabaseAdmin } from "./config/database/supabase.config.js";

async function signUpAsAdmin(email, password) {
    const { data, error } = await supabaseAdmin.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                role: 'admin', // Bạn tự định nghĩa key và value ở đây
                //full_name: 'Nguyen Van A'
            }
        }
    })

    if (error) {
        console.error('Lỗi đăng ký:', error.message)
        throw new Error(error.message);
    }
    else console.log('Đăng ký thành công, kiểm tra email của bạn!', data)
    return data
}

signUpAsAdmin("admin1@gmail.com", "123456")
await signUpAsAdmin("admin2@gmail.com", "123456")
await signUpAsAdmin("admin3@gmail.com", "123456")
await signUpAsAdmin("admin4@gmail.com", "123456")