package com.intellimed.telemedicine.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JoinInfoDto {
    private String roomName;
    private String domain;
    private String status;
}
