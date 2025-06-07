CREATE TABLE "Transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quantity" integer NOT NULL,
	"unitPrice" double precision NOT NULL,
	"type" text NOT NULL,
	"wac" double precision NOT NULL,
	"totalInventoryQuantity" integer NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
