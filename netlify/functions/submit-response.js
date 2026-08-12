const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event) {

  // Only accept POST requests
  if (event.httpMethod !== "POST") {
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

    const record = JSON.parse(event.body);

    // Basic validation
    if (!record.candidateA || !record.candidateB || !record.chosen) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          error: "Missing required survey data"
        })
      };
    }

    if (!["A", "B"].includes(record.chosen)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          error: "Invalid choice"
        })
      };
    }

    // Connect to Supabase using the server-side secret
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    const a = record.candidateA;
    const b = record.candidateB;

    // Flatten the nested candidate objects into the database columns
    const row = {
      participant_id: record.participantId,
      timestamp: record.timestamp || new Date().toISOString(),

      age: record.age,
      occupation: record.occupation,

      donor_state: record.donorState,

      chosen: record.chosen,
      allocation_priority: record.allocationPriority ?? null,
      allocation_consistent: record.allocationConsistent ?? null,

      // Candidate A
      candidate_a_case_id: a.caseId,
      candidate_a_age: a.age,
      candidate_a_wait_years: a.waitYears,
      candidate_a_dialysis_years: a.dialysisYears,
      candidate_a_hla_mismatch: a.hlaMismatch,
      candidate_a_state: a.state,
      candidate_a_prior_living_donor: a.priorLivingDonor,
      candidate_a_listed_as_child: a.listedAsChild,

      // Candidate B
      candidate_b_case_id: b.caseId,
      candidate_b_age: b.age,
      candidate_b_wait_years: b.waitYears,
      candidate_b_dialysis_years: b.dialysisYears,
      candidate_b_hla_mismatch: b.hlaMismatch,
      candidate_b_state: b.state,
      candidate_b_prior_living_donor: b.priorLivingDonor,
      candidate_b_listed_as_child: b.listedAsChild
    };

    const { data, error } = await supabase
      .from("responses")
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);

      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          success: false,
          error: "Database insertion failed"
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        id: data.id
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
        error: "Invalid request"
      })
    };
  }
};
