# Database Migration Required

To enable the new "Customer Phone Number" feature and ensure orders are saved correctly with customer details, please run the SQL in `update_orders_schema.sql` in your Supabase SQL Editor.

1. Go to your Supabase Project Dashboard.
2. Navigate to the SQL Editor.
3. Open `update_orders_schema.sql` (located in the root of your project).
4. Copy the content and run it in the SQL Editor.

This will add the `customer_name`, `customer_phone`, and `customer_email` columns to your `orders` table.

Until this is run, the app will continue to work but will not save the new customer details, and the Admin Panel will show "USER ID" instead of the customer name.
