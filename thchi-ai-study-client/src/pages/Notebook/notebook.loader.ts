import notebookService from "../../services/notebook.service";

export const notebookLoader = {
  getNotebook: () => {
    return notebookService.getNotebook();
  },
  getNotebookByStatus: (status: string) => {
    return notebookService.getNotebookByStatus(status);
  },
};
