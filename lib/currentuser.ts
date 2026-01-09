class CurrentUserManager {
    private userId: string | null = null;
    private userEmail: string | null = null;
    private userName: string | null = null;
    private userRole: string | null = null;
    
    // Getter로만 접근 가능 (읽기 전용)
    get id() { return this.userId; }
    get email() { return this.userEmail; }
    get name() { return this.userName; }
    get role() { return this.userRole; }
    
    setUser(user: { id: number; email: string; name: string; role: string }) {
        this.userId = String(user.id);
        this.userEmail = user.email;
        this.userName = user.name;
        this.userRole = user.role;
        console.log('✅ 사용자 설정:', this.email);
    }
    
    clear() {
        this.userId = null;
        this.userEmail = null;
        this.userName = null;
        this.userRole = null;
        console.log('🗑️ 사용자 초기화');
    }
    
    getAll() {
        return {
            id: this.userId,
            email: this.userEmail,
            name: this.userName,
            role: this.userRole
        };
    }
}

export const currentUser = new CurrentUserManager();