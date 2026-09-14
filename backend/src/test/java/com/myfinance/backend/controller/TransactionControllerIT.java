package com.myfinance.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.myfinance.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end regression for the two bugs this exact flow hit before being fixed:
 * RecurringTransaction/Transaction.type missing @JdbcTypeCode(SqlTypes.NAMED_ENUM), and the
 * category on a request body being a transient Jackson instance Hibernate refused to flush.
 */
@SpringBootTest
@AutoConfigureMockMvc
class TransactionControllerIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private String token;

    @BeforeEach
    void authenticate() throws Exception {
        token = loginAsNewUser(mockMvc);
    }

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder builder) {
        return builder.header("Authorization", "Bearer " + token);
    }

    private String createCategory(String name) throws Exception {
        String response = mockMvc.perform(auth(post("/api/categories"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.id");
    }

    @Test
    void createTransactionWithACategory_resolvesItAndPersists() throws Exception {
        String categoryId = createCategory("IT Transaction Category");

        mockMvc.perform(auth(post("/api/transactions"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"EXPENSE\",\"frequency\":\"ONE_TIME\","
                                + "\"category\":{\"id\":\"" + categoryId + "\"},"
                                + "\"amount\":42.50,\"date\":\"2026-05-01\",\"description\":\"IT test\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category.id").value(categoryId))
                .andExpect(jsonPath("$.category.name").value("IT Transaction Category"))
                .andExpect(jsonPath("$.amount").value(42.5));
    }

    @Test
    void createTransactionWithBlankType_returns400() throws Exception {
        mockMvc.perform(auth(post("/api/transactions"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"frequency\":\"ONE_TIME\",\"amount\":10,"
                                + "\"date\":\"2026-05-01\",\"description\":\"IT test\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").exists());
    }
}
