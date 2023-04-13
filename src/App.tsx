import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { supabase } from './lib/supabase';

import './styles/global.css';

/** TO-DO
 * [ X ] Validação / transformação
 * [ X ] Field arrays
 * [ X ] Upload de arquivos
 * [ X ] Composition Pattern
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5mb
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createUserFormSchema = z.object({
  avatar: z.instanceof(FileList)
    .refine((files) => !!files.item(0), "A imagem de perfil é obrigatória")
    .refine((files) => files.item(0) !== null && files.item(0)!.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB`)
    .refine(
      (files) => files.item(0) !== null && ACCEPTED_IMAGE_TYPES.includes(files.item(0)!.type),
      "Formato de imagem inválido"
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
      .min(1, 'No mínimo 1')
      .max(100, 'No máximo 100 caracteres'),
  })).min(2, 'Insira pelo menos 2 tecnologias')
    .refine(techs => {
      return techs.some(tech => tech.knowledge > 50)
    }, 'Você está aprendendo!'),
});

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  });

  async function createUser(data: CreateUserFormData) {
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
    <main className='h-screen bg-zinc-900 text-zinc-300 flex flex-col justify-center items-center gap-10'>
      <form
        className='flex flex-col gap-4 w-full max-w-sm'
        onSubmit={handleSubmit(createUser)}
      >
        <div className='flex flex-col gap-1'>
          <label htmlFor='avatar'>
            Avatar
          </label>

          <input
            type='file'
            accept='image/*'
            {...register('avatar')}
          />

          {
            errors.avatar && <span className='text-red-500 text-sm'>{errors.avatar.message}</span>
          }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='name'>
            Nome
          </label>

          <input
            className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            type='text'
            {...register('name')}
          />

          {
            errors.name && <span className='text-red-500 text-sm'>{errors.name.message}</span>
          }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='email'>
            E-mail
          </label>

          <input
            className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            type='email'
            {...register('email')}
          />

          {
            errors.email && <span className='text-red-500 text-sm'>{errors.email.message}</span>
          }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='senha'>
            Senha
          </label>

          <input
            className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
            type='password'
            {...register('password')}
          />

          {
            errors.password && <span className='text-red-500 text-sm'>{errors.password.message}</span>
          }
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor='tecnologias' className='flex justify-between items-center'>
            Tecnologias

            <button
              type='button'
              className='text-emerald-500 text-sm'
              onClick={addNewTech}
            >
              Adicionar
            </button>
          </label>

          {
            fields.map((field, index) => {
              return (
                <div
                  key={String(field.id)}
                  className='flex gap-2'
                >
                  <div className='flex-1 flex flex-col gap-1'>
                    <input
                      className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
                      type='text'
                      {...register(`techs.${index}.title`)}
                    />

                    {
                      errors.techs?.[index]?.title && <span className='text-red-500 text-sm'>{errors.techs?.[index]?.title?.message}</span>
                    }
                  </div>

                  <div className='w-20 flex flex-col gap-1'>
                    <input
                      className='border border-zinc-200 shadow-sm rounded h-10 px-3 bg-zinc-800 text-white'
                      type='number'
                      {...register(`techs.${index}.knowledge`)}
                    />

                    {
                      errors.techs?.[index]?.knowledge && <span className='text-red-500 text-sm'>{errors.techs?.[index]?.knowledge?.message}</span>
                    }
                  </div>
                </div>
              )
            })
          }

          {
            errors.techs && <span className='text-red-500 text-sm'>{errors.techs.message}</span>
          }
        </div>

        <button
          type='submit'
          className='h-10 bg-emerald-500 rounded font-semibold text-white hover:bg-emerald-600'
        >
          Salvar
        </button>
      </form>
    </main >
  )
}