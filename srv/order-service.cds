using fabTech as fab from '../db/schema.cds';

service OrderService @(path: '/order-service') {
  entity Manufacturers as
    projection on fab.Manufacturers {
      *,
      originCountry.name as country,

    }

  entity Products      as projection on fab.Products;
  entity OrderItems    as projection on fab.OrderItems;
  entity Orders        as projection on fab.Orders;
  entity Customers     as projection on fab.Customers;
  entity Invoices      as projection on fab.Invoices;
  action listProductsFromOrder(order : Orders:ID) returns array of Products;
  action payInvoice(invoice : Invoices:ID)        returns String;

  action createOrder(customer : Customers:name,
                     items : array of {
    product : Products:ID;
    quantity : Integer;
  })                                              returns Invoices;

  action cancelOrder(order : Orders:ID)           returns String;

}
