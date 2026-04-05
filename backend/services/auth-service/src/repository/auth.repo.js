import { supabaseUsers, supabaseAdmin } from "../config/database/supabase.config.js";

export class AuthServiceRepository {
    async signUp(email, password) {
        const { data, error } = await supabaseUsers.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    role: 'user', // Bạn tự định nghĩa key và value ở đây
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
    async signIn(email, password) {
        const { data, error } = await supabaseUsers.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) {
            console.error('Lỗi đăng nhập:', error.message)
            throw new Error(error.message)
        }
        else console.log('Đăng nhập thành công:', data.user)
        return data 
    }
}