using fabTech as fab from '../db/schema.cds';

service SupportService @(path: '/support-service') {

  entity SupportTickets as projection on fab.SupportTickets;
  entity Supporters as projection on fab.Supporters;
  action openTicketByUsername(userName : fab.Customers:name, order : fab.Orders:ID, subject : String, description : String) returns fab.SupportTickets:ID;
  action openTicketByUserID(userName : fab.Customers:ID, order : fab.Orders:ID, subject : String, description : String)     returns fab.SupportTickets:ID;
  action assignTicket(supportUsername : fab.Supporters:name)                                                                returns String;
  action resolveTicket(supportUsername : fab.Supporters:name, ticket : fab.SupportTickets:ID)                               returns SupportTickets;

  action getTickets()
}
