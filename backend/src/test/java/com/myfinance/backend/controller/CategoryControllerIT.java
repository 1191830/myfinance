package com.myfinance.backend.controller;

import com.myfinance.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CategoryControllerIT extends AbstractIntegrationTest {

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
    void createWithBlankName_returns400WithFieldError() throws Exception {
        mockMvc.perform(auth(post("/api/categories"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name", notNullValue()));
    }

    @Test
    void updateWithNegativeBudget_returns400WithFieldError() throws Exception {
        String createResponse = mockMvc.perform(auth(post("/api/categories"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"IT Negative Budget Test\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = com.jayway.jsonpath.JsonPath.read(createResponse, "$.id");

        mockMvc.perform(auth(put("/api/categories/" + id))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"IT Negative Budget Test\",\"monthlyBudget\":-10}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.monthlyBudget", notNullValue()));
    }

    @Test
    void createThenGetById_roundTrips() throws Exception {
        String createResponse = mockMvc.perform(auth(post("/api/categories"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"IT Round Trip Test\",\"monthlyBudget\":50}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String id = com.jayway.jsonpath.JsonPath.read(createResponse, "$.id");

        mockMvc.perform(auth(get("/api/categories/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("IT Round Trip Test"))
                .andExpect(jsonPath("$.monthlyBudget").value(50));
    }
}
