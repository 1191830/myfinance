package com.myfinance.backend.controller;

import com.myfinance.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves the household-sharing model: two accounts placed in the same household see and
 * can edit each other's data, while an account in a different household sees none of it.
 */
@SpringBootTest
@AutoConfigureMockMvc
class HouseholdSharingIT extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    private MockHttpServletRequestBuilder auth(MockHttpServletRequestBuilder builder, String token) {
        return builder.header("Authorization", "Bearer " + token);
    }

    @Test
    void sameHouseholdSharesData_differentHouseholdDoesNot() throws Exception {
        UUID sharedHousehold = newHousehold();
        String personA = seedUserAndLogin(mockMvc, sharedHousehold).token();
        String personB = seedUserAndLogin(mockMvc, sharedHousehold).token();
        String outsider = seedUserAndLogin(mockMvc).token(); // own, separate household

        String description = "IT household-shared category " + UUID.randomUUID();
        String createResponse = mockMvc.perform(auth(post("/api/categories"), personA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + description + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String categoryId = com.jayway.jsonpath.JsonPath.read(createResponse, "$.id");

        // Person B, same household, can see it and edit it.
        mockMvc.perform(auth(get("/api/categories/" + categoryId), personB))
                .andExpect(status().isOk());
        mockMvc.perform(auth(put("/api/categories/" + categoryId), personB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + description + " (renamed by B)\"}"))
                .andExpect(status().isOk());

        // The outsider, a different household, sees nothing of it: 404 by id, absent from
        // their own list.
        mockMvc.perform(auth(get("/api/categories/" + categoryId), outsider))
                .andExpect(status().isNotFound());

        String outsiderList = mockMvc.perform(auth(get("/api/categories"), outsider))
                .andReturn().getResponse().getContentAsString();
        List<String> outsiderCategoryIds = com.jayway.jsonpath.JsonPath.read(outsiderList, "$[*].id");
        assertThat(outsiderCategoryIds).doesNotContain(categoryId);
    }
}
