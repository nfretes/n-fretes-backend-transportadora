export interface DriverStatusResponse {
  nome: string;
  cpf: string;
  rota_ativa: boolean;
  origem: string | null;
  destino: string | null;
}
