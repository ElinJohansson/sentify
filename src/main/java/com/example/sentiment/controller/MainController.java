package com.example.sentiment.controller;

import com.example.sentiment.apis.SentimentCommunication;
import com.example.sentiment.apis.TwitterCommunication;

import com.example.sentiment.entities.*;
import com.example.sentiment.pojos.*;
import com.example.sentiment.utilities.*;
import com.example.sentiment.entities.SentimentQueryBuilder;
import com.example.sentiment.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import twitter4j.TwitterException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Controller
public class MainController {

    @Autowired
    TwitterCommunication twitterCommunication;
    @Autowired
    SentimentCommunication sentimentCommunication;
    @Autowired
    TweetRepository tweetRepository;
    @Autowired
    QueryRepository queryRepository;


    @GetMapping("/")
    public ModelAndView getStartPage() {
        return new ModelAndView("demo");
    }

    @PostMapping("/searchForTweets")
    @ResponseBody
    public SearchResource getTweets(@RequestParam String searchInput) {

        List<Tweet> newTweets = new ArrayList<>();
        List<Tweet> tweetObjectsScrubbed = new ArrayList<>();
        Documents sentimentQueryList;
        List<Sentiment> sentimentResponse = new ArrayList<>();
        List<Tweet> tweetsFromDatabase = new ArrayList<>();

        try {
            if (queryRepository.findByQueryText(searchInput) == null) {
                System.out.println("you reached line 55");
                QueryEntity query = new QueryEntity(searchInput);
                queryRepository.save(query);
            } else {
                System.out.println("you reached line 59");
                tweetsFromDatabase = (List<Tweet>) tweetRepository.findByQuery(queryRepository.findByQueryText(searchInput));
            }
            System.out.println("You got to line 60");
            newTweets = twitterCommunication.getTweetsByQuery(searchInput, queryRepository.findByQueryText(searchInput));
            sentimentQueryList = SentimentQueryBuilder.buildSentimentQueries(newTweets);
            sentimentResponse = sentimentCommunication.getSentiment(sentimentQueryList).stream().collect(Collectors.toList());
            System.out.println("You reached line 64");
            for (Tweet tweetObject : newTweets) { // TODO: Refactor to more efficient implementation
                for (Sentiment sentiment : sentimentResponse) {
                    if (sentiment.getId().equals(String.valueOf(tweetObject.gettweetId()))) {
                        tweetObject.setSentimentScore(Double.parseDouble(sentiment.getScore()));
                        break;
                    }
                }
            }
            System.out.println("you reached line 73");
            for (Tweet tweetObject : newTweets) {
                List<Tweet> duplicateTweets = (List) tweetRepository.findByTweetId(tweetObject.gettweetId());
                if (duplicateTweets.isEmpty()) {
                    tweetObjectsScrubbed.add(tweetObject);
                }
            }
            System.out.println("You reached line 80");
            tweetRepository.saveAll(tweetObjectsScrubbed);
            if (tweetObjectsScrubbed.isEmpty())
                System.out.println("No unique tweets not in db found for this query");
            System.out.println("you reached line 84");

        } catch (TwitterException e) {
            e.printStackTrace();
            System.out.println("No tweets were found for query: " + searchInput);
            return new SearchResource();
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Something went wrong with sentiment query");
        }
        List<Tweet> allTweets = Stream.concat(newTweets.stream(), tweetsFromDatabase.stream())
                .collect(Collectors.toList());
        System.out.println("You reached the last line");
        System.out.println("allTweets is empty?" + allTweets.isEmpty());
        if (allTweets.isEmpty()) {
            return new SearchResource(allTweets, 0);
        } else {

            return new SearchResource(allTweets, Statistics.getAverageSentimentOfTweets(allTweets));
        }
    }


}
