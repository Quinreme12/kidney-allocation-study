const { createClient } = require("@supabase/supabase-js");

exports.handler = async function(event) {

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        error: "Method not allowed"
      })
    };
  }

  try {

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const { count, error } = await supabase
      .from("responses")
      .select("*", {
        count: "exact",
        head: true
      });

    if (error) {
      console.error("Supabase count error:", error);

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          error: "Could not retrieve response count"
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        success: true,
        count: count
      })
    };

  } catch (error) {

    console.error("Server error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: false,
        error: "Server error"
      })
    };
  }
};
