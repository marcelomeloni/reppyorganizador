import { api } from "./apiService";

export type ComunicadoRecipient = {
  id:             string;
  full_name:      string;
  email:          string;
  ticket_type:    string;
  payment_status: string;
  batch_name:     string;
  category_name:  string | null;
};

export type ComunicadoFilter = {
  type:  string;
  value: string;
};

export type SendComunicadoBody = {
  sender_name: string;
  reply_to:    string;
  subject:     string;
  message:     string;
  filters:     ComunicadoFilter[];
};

export type SendComunicadoResponse = {
  sent: number;
};

const base = (slug: string, eventId: string) =>
  `/org/${slug}/events/${eventId}/comunicados`;

export const comunicadosService = {
  getRecipients: (token: string, slug: string, eventId: string) =>
    api
      .get<{ data: ComunicadoRecipient[] }>(`${base(slug, eventId)}/recipients`, token)
      .then((res) => res.data ?? []),

  send: (token: string, slug: string, eventId: string, body: SendComunicadoBody) =>
    api.post<SendComunicadoResponse>(base(slug, eventId), token, body),
};