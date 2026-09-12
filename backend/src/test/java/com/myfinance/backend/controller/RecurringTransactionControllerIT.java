package com.myfinance.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.myfinance.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end regression for the recurrence engine's headline behaviour: creating a template
 * with a past startDate backfills every due month immediately, and re-running the generator
 * afterward is a no-op. This is the flow that was manually curl-tested extensively this
 * session - this locks it in.
 */
@SpringBootTest
@AutoConfigureMockMvc
class RecurringTransactionControllerIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String createCategory(String name) throws Exception {
        String response = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.id");
    }

    @Test
    void creatingATemplateWithAPastStartDate_backfillsImmediately() throws Exception {
        String categoryId = createCategory("IT Recurring Category");
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusMonths(2).withDayOfMonth(11);
        String description = "IT recurring backfill test";

        String createResponse = mockMvc.perform(post("/api/recurring-transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"EXPENSE\",\"frequency\":\"RECURRING\","
                                + "\"recurrenceInterval\":\"MONTHLY\","
                                + "\"category\":{\"id\":\"" + categoryId + "\"},"
                                + "\"amount\":9.99,\"description\":\"" + description + "\","
                                + "\"startDate\":\"" + startDate + "\",\"active\":true}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String templateId = JsonPath.read(createResponse, "$.id");

        // Backfilled synchronously by the create call - no separate /generate needed.
        String txResponse = mockMvc.perform(get("/api/transactions")).andReturn().getResponse()
                .getContentAsString();
        List<String> dates = JsonPath.read(txResponse,
                "$[?(@.description == '" + description + "')].date");
        assertThat(dates).hasSize(3); // startDate's month, and the two months since
        assertThat(dates).contains(startDate.format(DateTimeFormatter.ISO_LOCAL_DATE));

        // Re-running the generator finds nothing new to do for this (or any other) template.
        String generateResponse = mockMvc.perform(post("/api/transactions/generate"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        assertThat((Integer) JsonPath.read(generateResponse, "$.generated")).isZero();

        // Clean up so this template doesn't keep backfilling in future test runs against the
        // same container within this JVM.
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .delete("/api/recurring-transactions/" + templateId));
    }
}
