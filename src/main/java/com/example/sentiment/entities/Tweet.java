package com.example.sentiment.entities;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Tweet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String handle; //UserName
    private String text;
    private LocalDateTime date;
    private double sentimentScore;


    //Foreign key to query-entity
    @ManyToOne
    private Query query;

    public Tweet() {
    }

    // Constructors
    public Tweet(String handle, String text, LocalDateTime date, double sentimentScore, Query query) {

        this.handle = handle;
        this.text = text;
        this.date = date;
        this.sentimentScore = sentimentScore;
        this.query = query;
    }



    // Getters & Setters
    public Long getId() {
        return id;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {

        this.handle = handle;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public double getSentimentScore() {
        return sentimentScore;
    }

    public void setSentimentScore(double sentimentScore) {
        this.sentimentScore = sentimentScore;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Query getQuery() {
        return query;
    }

    public void setQuery(Query query) {
        this.query = query;
    }
}
