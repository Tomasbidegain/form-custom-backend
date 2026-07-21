export interface ServerToClientEvents {
  "new-response": (data: {
    formId: string;
    totalResponses: number;
    response: {
      id: string;
      email: string | null;
      submittedAt: string;
    };
  }) => void;

  "update-counter": (data: { formId: string; count: number }) => void;

  notification: (data: {
    type: "success" | "error" | "info";
    message: string;
    response: {
      id: string;
      email: string | null;
      submittedAt: string;
    };
  }) => void;
}

export interface ClientToServerEvents {
  "join-form": (formId: string) => void;

  "leave-form": (formId: string) => void;

  authenticate: (
    data: { token: string },
    callback: (success: boolean, userId?: string) => void,
  ) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  userId?: string;
  email?: string;
  formsJoined: string[];
}
