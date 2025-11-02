import { BaseSchema } from '@adonisjs/lucid/schema'

export default class EnableRlsAndPoliciesRolesUsuarios extends BaseSchema {
  public async up() {
    // Enable RLS
    await this.schema.raw('ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;')
    await this.schema.raw('ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;')

    // Roles: allow SELECT to all authenticated users
    await this.schema.raw(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'roles' AND policyname = 'roles_select_authenticated'
        ) THEN
          CREATE POLICY roles_select_authenticated ON public.roles FOR SELECT USING (true);
        END IF;
      END $$;
    `)

    // Helper condition: admin check inline
    const adminCondition = `EXISTS (
      SELECT 1 FROM public.usuarios u
      JOIN public.roles r ON r.id = u.rol_id
      WHERE u.id = auth.uid() AND r.nombre = 'admin'
    )`

    // Usuarios: self access or admin
    await this.schema.raw(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'usuarios' AND policyname = 'usuarios_select_self_or_admin'
        ) THEN
          CREATE POLICY usuarios_select_self_or_admin ON public.usuarios
          FOR SELECT USING ( id = auth.uid() OR ${adminCondition} );
        END IF;
      END $$;
    `)

    await this.schema.raw(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'usuarios' AND policyname = 'usuarios_update_self_or_admin'
        ) THEN
          CREATE POLICY usuarios_update_self_or_admin ON public.usuarios
          FOR UPDATE USING ( id = auth.uid() OR ${adminCondition} )
          WITH CHECK ( id = auth.uid() OR ${adminCondition} );
        END IF;
      END $$;
    `)
  }

  public async down() {
    await this.schema.raw(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'usuarios' AND policyname = 'usuarios_select_self_or_admin'
        ) THEN
          DROP POLICY usuarios_select_self_or_admin ON public.usuarios;
        END IF;
      END $$;
    `)

    await this.schema.raw(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'usuarios' AND policyname = 'usuarios_update_self_or_admin'
        ) THEN
          DROP POLICY usuarios_update_self_or_admin ON public.usuarios;
        END IF;
      END $$;
    `)

    await this.schema.raw(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'roles' AND policyname = 'roles_select_authenticated'
        ) THEN
          DROP POLICY roles_select_authenticated ON public.roles;
        END IF;
      END $$;
    `)
  }
}
