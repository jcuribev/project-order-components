
# Components Orders

This project involves managing orders, products, and customers using SAP Cloud Application Programming (CAP). It includes features for creating orders, managing inventory, and validating data.

The service is deployed on SAP BTP and uses HANA as the database.

## Set up Project

**Note:** It is recommended to use the Business Application Studio in SAP BTP to run this project.
1.  Clone the Git repository:
    
    ```bash
    git clone https://github.com/jcuribev/project-order-components
    ```
    
2.  Navigate to the project directory:
    
    ```bash
    cd components-order
    ```
    
3.  Install the required dependencies:
    
    ```bash
    npm install
    ```
    
4.  Deploy the local DB:
    
    ```bash
    cds deploy --to sqlite
    ```
    
5.  To run the project locally, you will need to ```install NodeJS, CDS and SQLite```
    

## Key Features

-   Manage customer profiles, allowing you to create and edit customer details.
-   Add and organize products with detailed information.    
-   Create and process orders by linking products to specific customers.
-   Monitor the status of each order, from placement to delivery.
-   Generate and manage invoices, including viewing totals and tracking payments.
-   Use the tickets system to track support cases with their orders.
-   Create support users (Supporters) to handle tickets

## External Services

For this project I used SAP's *API_BUSINESS_PARTNER*, specifically the A_Customer entity. This entity is associated to the Customer entity through the **businessCostumer** field.

To successfully  create a Customer, the **businessCostumer** field must be an existing value from the A_Customer entity and it must be equal to the **Customer** field.

## Test It!

### Online:
-   Use the Postman collection from the repository and test the created operations.
-   You may also see the Index [here](https://4e230df9trial-trial-n6n251lf-trial-components-order-srv.cfapps.us10-001.hana.ondemand.com/).

### On localhost:
-   Run ```cds watch ```
-   Use the default requests in the HTTP folder

**Note**: If you are not using BAS, you need to install an extension such as ```REST Client``` for VSCode.
