// Cenas da Mesa: o que o grupo vê no lugar do que é só do Mestre.

/**
 * O grupo vê o nome público da cena (ou "Cena"), não o do Mestre. É só o que a tela mostra: o nome continua na linha
 * que o banco entrega (quem abrir o inspetor de rede lê), então spoiler de verdade fica em "visível" e na névoa.
 */
export const mascararCena = <T extends { nome: string; nome_publico: string | null }>(c: T, mestre: boolean): T => (mestre ? c : { ...c, nome: c.nome_publico?.trim() || 'Cena' });
