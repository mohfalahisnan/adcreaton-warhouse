declare namespace NodeJS {
	export interface ProcessEnv extends Dict<string> {
	  PORT ?: string;
	  DATABASE_URL?: string;
	  NEXTAUTH_URL?: string;
	  AUTH_SECRET?: string;
	}
}
