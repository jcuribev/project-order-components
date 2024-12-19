namespace fabTech;

using {
  Country,
  managed
} from '@sap/cds/common';

using {API_BUSINESS_PARTNER.A_Customer} from '../srv/external/API_BUSINESS_PARTNER';

type OrderStatus   : String enum {
  OPEN;
  DELIVERED;
  CANCELLED;
}

type TypeOfProduct : String(3) enum {
  CPU;
  GPU;
}

type PaymentStatus : String enum {
  PENDING;
  PAID;
}

type TicketStatus  : String enum {
  OPEN;
  IN_PROGRESS;
  CLOSED;
}

entity Manufacturers {
  key ID            : UUID;
      name          : String(20);
      originCountry : Country;
      products      : Association to many Products
                        on products.manufacturer = $self;

}

entity Products {
  key ID            : UUID;
      name          : String(50)                       @mandatory;
      price         : Decimal(6, 2) default 0;
      manufacturer  : Association to one Manufacturers @mandatory;
      typeOfProduct : TypeOfProduct                    @mandatory;
      stock         : Integer default 0;
}

entity OrderItems {
  key ID       : UUID;
      order    : Association to one Orders;
      product  : Association to one Products @assert.target: 'stock > 0';
      quantity : Integer;
      total    : Decimal(12, 2);
}

entity Orders : managed {
  key ID       : UUID;
      customer : Association to one Customers;
      items    : Association to many OrderItems
                   on items.order = $self;
      total    : Decimal(16, 2) default 0;
      status   : OrderStatus default 'OPEN';
}


entity Customers {
  key ID                   : UUID;
      name                 : String(100) @mandatory;
      address              : String(200) @mandatory;
      order                : Association to many Orders
                               on order.customer = $self;
      businessCostumer : String(10);
}

entity Invoices : managed {
  key ID            : UUID;
      order         : Association to one Orders;
      amount        : Decimal(10, 2);
      paymentStatus : String(20) default 'PENDING';
      invoiceDate   : DateTime;
}

entity Supporters {
  key ID                   : UUID;
      name                 : String(100) @mandatory;
      supportTickets       : Association to many SupportTickets
                               on supportTickets.supporter = $self;
}


entity SupportTickets : managed {
  key ID          : UUID;
      subject     : String(100)  @mandatory;
      description : String(1000) @mandatory;
      status      : TicketStatus default 'OPEN';
      customer    : Association to Customers;
      supporter   : Association to Supporters;
      order       : Association to Orders;
}

annotate SupportTickets with {
  modifiedAt @odata.etag;
  modifiedBy @odata.etag;
}
