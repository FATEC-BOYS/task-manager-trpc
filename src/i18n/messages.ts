export const messages = {
  en: {
    brand:"Artefact-inspired · Technical case", workspace:"Productivity workspace", tagline:"Organize your work. Focus on what matters.",
    createHeading:"Create a task", title:"Title", titlePlaceholder:"What needs to be done?", description:"Description (optional)", descriptionPlaceholder:"Add some details",
    creating:"Creating...", add:"+ Add task", tasks:"Your tasks", loaded:"{loaded} of {total} loaded · {completed} completed in view",
    syncing:"Syncing…", empty:"No tasks yet. Create your first one above.", save:"Save", cancel:"Cancel", edit:"Edit", delete:"Delete",
    loading:"Loading more tasks…", more:"Load more tasks", caught:"You’re all caught up.",
    titleRequired:"Please enter a task title.", loadError:"Unable to load tasks: {message}", confirmDelete:"Delete this task?",
    markComplete:"Mark {title} as complete", markIncomplete:"Mark {title} as incomplete",
    darkMode:"Dark mode", lightMode:"Light mode", language:"Language"
  },
  pt: {
    brand:"Inspirado na Artefact · Desafio técnico", workspace:"Espaço de produtividade", tagline:"Organize seu trabalho. Foque no que importa.",
    createHeading:"Criar tarefa", title:"Título", titlePlaceholder:"O que precisa ser feito?", description:"Descrição (opcional)", descriptionPlaceholder:"Adicione detalhes",
    creating:"Criando...", add:"+ Adicionar tarefa", tasks:"Suas tarefas", loaded:"{loaded} de {total} carregadas · {completed} concluídas nesta lista",
    syncing:"Sincronizando…", empty:"Nenhuma tarefa ainda. Crie a primeira acima.", save:"Salvar", cancel:"Cancelar", edit:"Editar", delete:"Excluir",
    loading:"Carregando mais tarefas…", more:"Carregar mais tarefas", caught:"Tudo em dia!",
    titleRequired:"Digite um título para a tarefa.", loadError:"Não foi possível carregar as tarefas: {message}", confirmDelete:"Excluir esta tarefa?",
    markComplete:"Marcar {title} como concluída", markIncomplete:"Marcar {title} como pendente",
    darkMode:"Modo escuro", lightMode:"Modo claro", language:"Idioma"
  }
} as const;
export type Locale = keyof typeof messages;
