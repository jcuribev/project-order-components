// using {OrderService.Orders} from './order-service.cds';

// annotate Orders with @(restrict: [
//   {
//     grant: ['CREATE'],
//     to   : 'customer',
//   },
//   {
//     grant: [
//       'READ',
//       'UPDATE',
//       'DELETE'
//     ],
//     to   : 'customer',
//     where: 'customer.ID = $user.id',
//   },
//   {
//     grant: ['READ'],
//     to   : [
//       'supporter',
//       'admin'
//     ]
//   }
// ]);
