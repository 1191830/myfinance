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

@SpringBootTest
@AutoConfigureMockMvc
class InvestmentControllerIT extends AbstractIntegrationTest {

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

    @Test
    void syncPrices_withNoEligibleInvestments_syncsZero() throws Exception {
        mockMvc.perform(auth(post("/api/investments/sync-prices")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.synced").value(0));
    }

    @Test
    void addPurchase_blendsIntoAnExistingInvestment() throws Exception {
        String createResponse = mockMvc.perform(auth(post("/api/investments"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"Crypto\",\"ticker\":\"BTC\",\"quantity\":0.5,"
                                + "\"amountInvested\":10000,\"currentValue\":12000,"
                                + "\"startDate\":\"2025-01-01\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = JsonPath.read(createResponse, "$.id");

        mockMvc.perform(auth(post("/api/investments/" + id + "/buy"))
                        .param("quantity", "0.5")
                        .param("unitPrice", "30000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(1.0))
                .andExpect(jsonPath("$.amountInvested").value(25000))
                .andExpect(jsonPath("$.currentValue").value(27000));
    }

    @Test
    void addPurchase_withNonPositiveQuantity_returns400() throws Exception {
        mockMvc.perform(auth(post("/api/investments/" + java.util.UUID.randomUUID() + "/buy"))
                        .param("quantity", "0")
                        .param("unitPrice", "100"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void addPurchase_withUnknownId_returns404() throws Exception {
        mockMvc.perform(auth(post("/api/investments/" + java.util.UUID.randomUUID() + "/buy"))
                        .param("quantity", "1")
                        .param("unitPrice", "100"))
                .andExpect(status().isNotFound());
    }
}
