const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {

  try {

    // Connect to Supabase using credentials stored
    // securely in Netlify environment variables.
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Create a fake response for testing.
    const testResponse = {
      participant_id: "TEST",
      age: 99,
      occupation: "TEST",
      donor_state: "WI",
      chosen: "A",
      allocation_priority: "B",
      allocation_consistent: false
    };

    // Insert the test response into the responses table.
    const { data, error } = await supabase
      .from('responses')
      .insert(testResponse)
      .select();

    if (error) {

      console.error("Supabase error:", error);

      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: error.message
        })
      };
    }

    // Tell the browser that the insertion worked.
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: data
      })
    };

  } catch (error) {

    console.error("Server error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
