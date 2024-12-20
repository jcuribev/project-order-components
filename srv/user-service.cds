using fabTech as fab from '../db/schema.cds';
using {API_BUSINESS_PARTNER as external} from './external/API_BUSINESS_PARTNER';

service UserService @(path: '/user-service') {

    entity Products         as projection on fab.Products;
    entity OrderItems       as projection on fab.OrderItems;
    entity Orders           as projection on fab.Orders;
    entity Customers        as projection on fab.Customers;
    entity Invoices         as projection on fab.Invoices;
    entity Supporters       as projection on fab.Supporters;

    entity ExternalCustomer as
        projection on external.A_Customer {
            Customer,
            CustomerName
        };

    action fetchCustomerInformation(customer : Customers:name)                                                                       returns Customers;
    action fetchBusinessPartner(businessPartnerID : ExternalCustomer:Customer)                                                       returns Map;
    action createCustomer(customerName : Customers:name, address : Customers:address, businessPartnerID : ExternalCustomer:Customer) returns Customers;
    action updateUserDetails(userID : UUID, changes : Map)                                                                           returns Boolean;
    action createSupporter(supporterName : Supporters:name)                                                                          returns Supporters;
}
