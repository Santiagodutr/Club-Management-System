import { BaseSchema } from '@adonisjs/lucid/schema'

export default class TriggerOnAuthUsersCreateUsuario extends BaseSchema {
  public async up() {
    // Function to insert default usuario row with 'particular' role when a new auth.user is created
    await this.schema.raw(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
        v_rol_id INTEGER;
      BEGIN
        SELECT id INTO v_rol_id FROM public.roles WHERE nombre = 'particular' LIMIT 1;
        IF v_rol_id IS NULL THEN
          -- If role is missing, create it on the fly
          INSERT INTO public.roles (nombre, descripcion, created_at, updated_at)
          VALUES ('particular', 'Rol por defecto', NOW(), NOW())
          ON CONFLICT (nombre) DO NOTHING;
          SELECT id INTO v_rol_id FROM public.roles WHERE nombre = 'particular' LIMIT 1;
        END IF;

        INSERT INTO public.usuarios (id, rol_id, created_at, updated_at)
        VALUES (NEW.id, v_rol_id, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
    `)

    // Create trigger on auth.users
    await this.schema.raw(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `)
  }

  public async down() {
    await this.schema.raw('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;')
    await this.schema.raw('DROP FUNCTION IF EXISTS public.handle_new_user();')
  }
}
