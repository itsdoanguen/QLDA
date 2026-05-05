import { ApiProperty } from '@nestjs/swagger';

export type LandRecordStatus =
	| 'Draft'
	| 'Cho_doi_soat'
	| 'Can_bo_sung'
	| 'Da_doi_soat'
	| 'Da_Mint';

export class LandRecordSummary {
	@ApiProperty()
	id: number;

	@ApiProperty()
	ownerId: number;

	@ApiProperty()
	address: string;

	@ApiProperty()
	area: number;

	@ApiProperty({ enum: ['Draft', 'Cho_doi_soat', 'Can_bo_sung', 'Da_doi_soat', 'Da_Mint'] })
	status: LandRecordStatus;

	@ApiProperty()
	updatedAt: string;
}

export class LandFileResponse {
	@ApiProperty()
	id: number;

	@ApiProperty()
	fileName: string;

	@ApiProperty()
	fileType: string;

	@ApiProperty()
	ipfsCid: string;

	@ApiProperty({ required: false })
	recordId?: number;

	@ApiProperty()
	createdAt: string;
}

