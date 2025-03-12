export interface INotification {
  take?: number;
  page?: number;

  id: string;
  title: string;
  message: string;
  type: 'freightRequest' | 'freightDelivery' | 'chat' | 'freightAccepted';
  isRead: boolean;
  timestamp: string;
  freightRequestId?: string;
  freightId?: string;
  userDriveId?: string;
  companyId?: string;
  freightRouteId?: string;
  freightRequest?: {
    id: string;
    freightId: string;
    userDriveId: string;
    companyId: string;
  };
  freight?: {
    id: string;
    originCity?: string;
    originState?: string;
    destinyCity?: string;
    destinyState?: string;
    dateOrigin?: string; 
    dateReceiver?: string; 
    typeOfLoad?: string;
    specieOfLoad?: string;
    vehicleTypes?: string[]; 
    bodyTypes?: string[]; 
    openSolicitations?: boolean;
    createdAt?: string; 
    companyId?: string;
  };
  userDrive?: {
    id: string;
    name?: string;
  };
  company?: {
    id: string;
    name?: string;
    nameFantasy?: string; 
    email?: string;
    phoneNumber?: string;
    cnpj?: string;
  };
  freightRoute?: {
    id: string;
    freightId?: string;
    userDriveId?: string;
    name?: string;
  };
}