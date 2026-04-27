export type LandRecordStatus =
	| 'Draft'
	| 'Cho_doi_soat'
	| 'Can_bo_sung'
	| 'Da_doi_soat'
	| 'Da_Mint';

export interface LandRecordSummary {
	id: number;
	ownerId: number;
	address: string;
	area: number;
	status: LandRecordStatus;
	updatedAt: string;
}
