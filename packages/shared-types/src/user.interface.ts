export type UserStatus = 'Active' | 'Inactive';

export interface UserProfile {
	id: number;
	roleCode: string;
	vneidNumber: string;
	fullName: string;
	email?: string;
	phone?: string;
	status: UserStatus;
	createdAt: string;
}
