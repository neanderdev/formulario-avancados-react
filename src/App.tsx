import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, XCircle } from 'lucide-react'

import { supabase } from './lib/supabase'

import { Form } from './components/Form'

import './styles/global.css'

/** TO-DO
 * [ X ] Validação / transformação
 * [ X ] Field arrays
 * [ X ] Upload de arquivos
 * [ X ] Composition Pattern
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const createUserSchema = z.object({
  avatar: z.instanceof(FileList)
    .refine((files) => !!files.item(0), 'A imagem de perfil é obrigatória')
    .refine((files) => files.item(0) !== null && files.item(0)!.size <= MAX_FILE_SIZE, 'Tamanho máximo de 5MB')
    .refine(
      (files) => files.item(0) !== null && ACCEPTED_IMAGE_TYPES.includes(files.item(0)!.type),
      'Formato de imagem inválido'
    ).transform(files => {
      return files.item(0)!
    }),
  name: z.string()
    .nonempty('O nome é obrigatório')
    .transform(name => {
      return name.trim().split(' ').map(word => {
        return word[0].toLocaleUpperCase().concat(word.substring(1));
      }).join(' ');
    }),
  email: z.string()
    .nonempty('O e-mail é obrigatório')
    .email('Formato de e-mail inválido')
    .refine(email => {
      return email.endsWith('@gmail.com');
    }, 'O e-mail precisa ser do gmail'),
  password: z.string()
    .min(6, 'A senha precisa do mínimo 6 caracteres'),
  techs: z.array(z.object({
    title: z.string().nonempty('O título é obrigatório'),
    knowledge: z.coerce
      .number()
      .min(0, 'No mínimo 0')
      .max(100, 'No máximo 100 caracteres'),
  })).min(2, 'Insira pelo menos 2 tecnologias')
    .refine(techs => {
      let titleIsExists = false;

      techs.map(tech => {
        if (!tech.title) {
          titleIsExists = true;
        }
      })

      if (!titleIsExists) {
        return techs.some(tech => tech.knowledge > 50)
      } else {
        return true
      }
    }, 'Você está aprendendo!'),
});

type CreateUserData = z.infer<typeof createUserSchema>;

export default function App() {
  const createUserForm = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
    watch,
    control,
  } = createUserForm;

  const userPassword = watch('password')
  const isPasswordStrong = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})').test(userPassword)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  });

  async function createUser(data: CreateUserData) {
    const { data: uploadData, error } = await supabase.storage.from('form-react').upload(
      data.avatar.name,
      data.avatar
    );

    console.log(uploadData);
    console.log(error);
    console.log(data);
  }

  function addNewTech() {
    append({
      title: '',
      knowledge: 0,
    });
  }

  return (
    <main className='h-screen flex flex-row gap-6 items-center justify-center'>
      <FormProvider {...createUserForm}>
        <form
          onSubmit={handleSubmit(createUser)}
          className='flex flex-col gap-4 w-full max-w-xs'
        >
          <Form.Field>
            <Form.Label htmlFor='avatar'>
              Avatar
            </Form.Label>

            <Form.Input type='file' name='avatar' />

            <Form.ErrorMessage field='avatar' />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor='name'>
              Nome
            </Form.Label>

            <Form.Input type='name' name='name' />

            <Form.ErrorMessage field='name' />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor='email'>
              E-mail
            </Form.Label>

            <Form.Input type='email' name='email' />

            <Form.ErrorMessage field='email' />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor='password'>
              Senha

              {
                isPasswordStrong
                  ? <span className='text-xs text-emerald-600'>Senha forte</span>
                  : <span className='text-xs text-red-500'>Senha fraca</span>
              }
            </Form.Label>

            <Form.Input type='password' name='password' />

            <Form.ErrorMessage field='password' />
          </Form.Field>

          <Form.Field>
            <Form.Label>
              Tecnologias

              <button
                type='button'
                onClick={addNewTech}
                className='text-emerald-500 font-semibold text-xs flex items-center gap-1'
              >
                Adicionar nova

                <PlusCircle size={14} />
              </button>
            </Form.Label>

            <Form.ErrorMessage field='techs' />

            {fields.map((field, index) => {
              const title = `techs.${index}.title`
              const knowledge = `techs.${index}.knowledge`

              return (
                <div
                  key={field.id}
                  className='flex gap-2'
                >
                  <Form.Field>
                    <div className='flex-1 flex flex-col gap-1'>
                      <Form.Input type={title} name={title} />

                      <Form.ErrorMessage field={title} />
                    </div>
                  </Form.Field>

                  <Form.Field>
                    <div className='w-20 flex flex-col gap-1'>
                      <Form.Input type={knowledge} name={knowledge} />

                      <Form.ErrorMessage field={knowledge} />
                    </div>
                  </Form.Field>

                  <button
                    type='button'
                    onClick={() => remove(index)}
                    className='text-red-500'
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              )
            })}
          </Form.Field>

          <button
            type='submit'
            disabled={isSubmitting}
            className='bg-violet-500 text-white rounded px-3 h-10 font-semibold text-sm hover:bg-violet-600'
          >
            Salvar
          </button>
        </form>
      </FormProvider>
    </main >
  )
}