-- CreateTable
CREATE TABLE "action_logs" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "context" VARCHAR(50) NOT NULL,
    "action" VARCHAR(150) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "document" VARCHAR(20),
    "is_active" BOOLEAN DEFAULT true,
    "logo_path" VARCHAR(100),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
