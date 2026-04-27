import { ApiProperty } from '@nestjs/swagger';

export type UserStatus = 'Active' | 'Inactive';

export class UserProfile {
	@ApiProperty()
	id: number;

	@ApiProperty()
	roleCode: string;

	@ApiProperty()
	vneidNumber: string;

	@ApiProperty()
	fullName: string;

	@ApiProperty({ required: false })
	email?: string;

	@ApiProperty({ required: false })
	phone?: string;

	@ApiProperty({ enum: ['Active', 'Inactive'] })
	status: UserStatus;

	@ApiProperty()
	createdAt: string;
}
