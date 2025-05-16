import { type QueryClient, queryOptions } from '@tanstack/react-query';
import type { LoaderFunctionArgs } from 'react-router';

// export async function getContact(id: string) {
//   await fakeNetwork()
//   let contacts = await localforage.getItem<Contact[]>('contacts')
//   if (!contacts) return null
//   let contact = contacts.find((contact) => contact.id === id)
//   return contact ?? null
// }

// export const contactDetailQuery = (id: string) =>
//   queryOptions({
//     queryKey: ['contacts', 'detail', id],
//     queryFn: async () => {
//       const contact = await getContact(id)
//       if (!contact) {
//         throw new Response('', {
//           status: 404,
//           statusText: 'Not Found',
//         })
//       }
//       return contact
//     },
//   })

// export const loader =
//   (queryClient: QueryClient) =>
//     async ({ params }: LoaderFunctionArgs) => {
//       await queryClient.ensureQueryData(contactDetailQuery(params))
//       return { contactId: params.contactId }
//     }