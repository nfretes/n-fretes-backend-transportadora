import { FreightRequestStatus } from '@entities/freight-requests.entity';

export interface ParamsFreightRequest {
  id?: string;
  take?: number;
  page?: number;
  freightId?: string;
  userDriveId?: string;
  status?: FreightRequestStatus;
  companyId?: string;
}
