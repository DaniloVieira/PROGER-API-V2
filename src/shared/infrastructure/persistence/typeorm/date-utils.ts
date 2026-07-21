/**
 * Extrai a parte de data (YYYY-MM-DD) de um Date de forma timezone-safe.
 *
 * Usa os componentes UTC para evitar o problema de shift de dia que ocorre
 * quando `new Date(dateString).toISOString()` é usado em fusos horários negativos
 * (ex: UTC-3), onde meia-noite UTC vira o dia anterior no horário local.
 *
 * Em Oracle, DT_PROGRAMACAO é um campo DATE que pode armazenar data com hora.
 * O oracledb converte para UTC ao retornar, e toDateString extrai a data UTC.
 * IMPORTANTE: como o Oracle armazena datas em horário local (BRT, UTC-3),
 * um registro "2026-06-24 00:00:00 BRT" é retornado como "2026-06-24T03:00:00Z",
 * e toDateString retorna "2026-06-24" — o dia correto em horário local.
 */
export function toDateString(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Cria um Date UTC correspondente ao início do dia (meia-noite UTC).
 * Usado para parâmetros de query em comparações de data por range,
 * onde precisamos do limite inferior do dia.
 */
export function startOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T00:00:00Z`);
}

/**
 * Cria um Date UTC correspondente ao final do dia (23:59:59.999 UTC).
 * Usado para parâmetros de query em comparações de data por range,
 * onde precisamos do limite superior do dia.
 */
export function endOfDay(dateStr: string): Date {
	return new Date(`${dateStr}T23:59:59.999Z`);
}

/**
 * Cria um Date UTC correspondente ao início do dia anterior (buffer -1 dia).
 * Usado como limite inferior em queries Oracle onde o banco armazena
 * datas em horário local (BRT, UTC-3). Um range UTC puro pode não
 * cobrir registros locais que caem no limite do dia.
 *
 * Exemplo: "2026-06-24" → "2026-06-23T00:00:00Z"
 * No Oracle BRT, isso vira "2026-06-22 21:00:00", cobrindo
 * registros desde "2026-06-22 21:00:00" local em diante.
 */
export function startOfDayWithBuffer(dateStr: string): Date {
	const d = new Date(`${dateStr}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() - 1);
	return d;
}

/**
 * Cria um Date UTC correspondente ao final do dia seguinte (buffer +1 dia).
 * Usado como limite superior em queries Oracle onde o banco armazena
 * datas em horário local (BRT, UTC-3). Garante que registros no limite
 * do dia sejam incluídos independente do offset de timezone.
 *
 * Exemplo: "2026-06-27" → "2026-06-28T23:59:59.999Z"
 * No Oracle BRT, isso vira "2026-06-28 20:59:59", cobrindo
 * registros até "2026-06-28 20:59:59" local.
 */
export function endOfDayWithBuffer(dateStr: string): Date {
	const d = new Date(`${dateStr}T23:59:59.999Z`);
	d.setUTCDate(d.getUTCDate() + 1);
	return d;
}

/**
 * Cria um Date UTC no meio do dia (12:00:00 UTC).
 * Usado para gravar datas em bancos de dados, pois o meio-dia UTC
 * sobrevive a qualquer offset de timezone (-12 a +14 horas) sem
 * mudar o componente de data no horário local.
 *
 * Isso garante que tanto SQLite (que converte para horário local)
 * quanto Oracle (que usa o timezone da sessão) preservem o dia correto.
 */
export function safeNoon(dateStr: string): Date {
	return new Date(`${dateStr}T12:00:00Z`);
}
