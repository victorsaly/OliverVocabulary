<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Vocabulary Game V1.0.6</ion-title>
        <ion-chip slot="end">
          <ion-icon :icon="star" color="dark"></ion-icon>
          <ion-label>{{ stars }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>
    <ion-item v-show="false">
      <ion-label>Level</ion-label>
      <ion-select
        interface="popover"
        
        :value="selectedLevel"
        @ionChange="selectedLevel = $event.target.value"
      >
        <ion-select-option value="11+">11+</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-item>
      <ion-label>Operator</ion-label>
      <ion-select
        interface="popover"
        :value="selectedOperator"
        
        @ionChange="
          selectedOperator = $event.target.value;
          askQuestion;
        "
        >>
        <ion-select-option value="vocabulary">Vocabulary</ion-select-option>
        <ion-select-option value="synonyms">Synonyms</ion-select-option>
        <ion-select-option value="antonyms">Antonyms</ion-select-option>
      </ion-select>
    </ion-item>
    <ion-content :fullscreen="true">
      <BotFace
        :botState="botState"
        :isPlayMode="isPlayMode"
        :text="speech_phrases"
        v-on:ask_question="askQuestion"
        @click="changeStatus('laughing')"
      />
    </ion-content>
    
      <ion-footer no-padding style="margin-bottom:5px;">
          <ion-button
          v-if="isPlayMode && !isTalking && botState != 'broken'"
          expand="full"
          @click.prevent="askQuestion"
          >Start new vocabulary</ion-button
        >
      </ion-footer>
  </ion-page>
</template>
<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonChip,
  IonLabel,
  IonIcon,
  toastController,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonFooter
} from "@ionic/vue";
import BotFace from "@/components/BotFace.vue";
import vocabularyData from '../../public/assets/data/vocabulary.json'
import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer,
  ResultReason,
  PropertyId,
} from "microsoft-cognitiveservices-speech-sdk";
import axios from "axios";
import { star } from "ionicons/icons";
export default {
  name: "Vocabulary",
  components: {
    BotFace,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonChip,
    IonLabel,
    IonIcon,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonFooter
  },
  data() {
    return {
      vocabulary: vocabularyData,
      typeText:[],
      isLoading: true,
      isOnBoundary: false,
      isTalking: false,
      isListening: false,
      isComputing: false,
      isLaughing: false,
      isError: false,
      isQuery: false,
      isPlayMode: true,
      isResolved: false,
      text: "",
      selectedLevel: "11+",
      selectedOperator: "vocabulary",
      speech_phrases:
        "Click play, listen the word and respond with back by talking your answer.",
      synth: window.speechSynthesis,
      encourage_phases: [
        "Well done!",
        "Great work!",
        "Good job!",
        "Keep up the good work!",
        "You've really got this!",
      ],
      correct_phases: [
        "That's correct",
        "That's right",
        "That's true",
        "Flawless",
        "Perfect",
      ],
      incorrect_phases: [
        "Not quite",
        "Maybe next time",
        "I'm sure you can get the next one right",
        "Incorrect",
      ],
      voiceList: [],
      greetingSpeech: new window.SpeechSynthesisUtterance(),
      audioConfig: null,
      speechConfig: null,
      speechRecognizer: null,
      speechRecording: null,
      word:null,
      number1: 2,
      number2: 3,
      // eslint-disable-next-line no-undef
      token: null,
      baseUrl: process.env.VUE_APP_BASE_URL,      
      openAi_apiKey : process.env.VUE_APP_TOKEN_AI,
      previousPosition: -1,
      stars: 0,
      isMicrophoneEnabled: false,
      publicPath: process.env.BASE_URL,
      axiosClient: null,
    };
  },
  computed: {
    botState() {
      if (this.isError) {
        return "broken";
      }
      if (this.isLaughing){
        return "laughing";
      }
      if (this.isTalking) {
        return "speaking";
      } else if (this.isListening) {
        return "listening";
      } else if (this.isComputing) {
        return "computing";
      } else {
        return "thinking";
      }
    },
  },
  methods: {
    changeStatus(status) {
      if (this.timeout) 
          if (status == "laughing"){
            var audio = new Audio(window.location.origin + this.$route.path + this.publicPath + 'assets/sound/laugh.wav');
            audio.play();
            this.isLaughing = true;
          }
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(() => {
            this.isLaughing = false;
          }, 1500); // delay
    },
    keyDownHandler(e) {
      let value = e.key * 1;
      if (!isNaN(parseFloat(value)) && isFinite(value)){
        this.typeText.push(value);
        if (this.timeout) 
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(() => {
            if (this.typeText.length > 0){
              var typeText = this.typeText.join('');
              this.showToast("Your writing response is : " + typeText, "secondary");
              //this.validateWord(typeText);
              this.typeText = [];
            }
          }, 400); // delay
      }
    },
    async showToast(text, color) {
      const toast = await toastController.create({
        message: text,
        duration: 10000,
        color: color,
        translucent: false,
        cssClass:"toast-custom-position",
        animated:false,
      });
      return toast.present();
    },
    async enableMicrophone() {
      var self = this;
      if (!this.isMicrophoneEnabled) {
        self.speech_phrases = "enabling microphone..";
        self.isMicrophoneEnabled = true;
        await navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then(function (e) {
            self.audioConfig = AudioConfig.fromMicrophoneInput(e.id);
            self.speech_phrases = "microphone enabled";
          })
          .catch(function () {
            self.speech_phrases = "microphone disabled";
            self.isError = true;
            self.showToast("Microphone disabled", "danger");
            self.isMicrophoneEnabled = false;
          });
      }else{
        return;
      }
    },
    async askQuestion() {
      this.audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      this.isResolved = false;
      this.isComputing = true;
      var self = this;
      self.text = null;
      self.speech_phrases= null;

      const randomWord = self.vocabulary[(Math.random() * self.vocabulary.length) | 0];
      self.word = randomWord;

      await this.enableMicrophone()
        .then(function () {
          const isEnabled = self.isMicrophoneEnabled === true;
          console.log('isMicrophoneEnabled', isEnabled);
          console.log('selectedOperator', self.selectedOperator);

          if (isEnabled) {
            self.isComputing = false;            
            self.isQuery = true;
            self.isPlayMode = false;
            self.speech_phrases = "";
            
            

            let apiType = "wordMeaning";
            if (self.selectedOperator == "synonyms")
            {
              apiType =  "wordSynonyms";
              self.text =
              "What is the synonyms of '" +
              self.word +
              "'?";
              self.speak();
            }
            else if (self.selectedOperator == "antonyms")
            {
              apiType = "wordAntonyms";
              self.text =
              "What is the antonyms of '" +
              self.word +
              "'?";
              self.speak();
            }else{
              self.text =
              "What '" +
              self.word +
              "' means?";
              self.speak();
            }

            self.axiosClient.get(apiType + "?word=" + self.word)    .then(response => {
                    // Handle response
                    console.log(response.data);
                });

          } else {
            self.speech_phrases = "microphone not available";
            self.isError = true;
            self.showToast("Microphone not available", "danger");
          }
        })
        .catch(function (e) {
          console.log("internal server error", e);
          self.isError = true;
          self.text = "internal error";
          self.showToast(self.text);
        });
    },
    /**
     * Shout at the user
     */
    speak() {
        console.log('speak', this.text);
        if (!this.synth.speaking){
          this.greetingSpeech.text = this.text;
          this.synth.speak(this.greetingSpeech);
        } else {
          console.error('Already speaking...');
          this.synth.cancel();
          if (this.timeout) 
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(() => {
            this.greetingSpeech.text = this.text;
            this.synth.speak(this.greetingSpeech);
          }, 600); // delay
        }
    },
    stopSpeech(){
        console.log('stop speech');
        this.isListening = false;
        this.isComputing = false;
        
        if (this.speechRecording)
        {
          this.speechRecording.close();
          this.speechRecording = null;
        }
    },
    async listen() {
      
      this.showToast("Listening...", "warning");
      this.isComputing = true;
      this.isListening = false;
      this.audioConfig = AudioConfig.fromDefaultMicrophoneInput();
      
      var sc = SpeechConfig.fromAuthorizationToken(
        // eslint-disable-next-line no-undef
        this.token,
        "uksouth"
      );
      sc.speechRecognitionLanguage = "en-GB";
      sc.setProperty(PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "4000");
      this.speechConfig = sc;
      this.speechRecording = new SpeechRecognizer(
        this.speechConfig,
        this.audioConfig
      );
      await this.listenForSpeechRecordingEvents();
    },
    /**
     * React to speech recording events
     */
    async listenForSpeechRecordingEvents() {
      const self = this;

      // Signals that a new session has started with the speech service
      this.speechRecording.speechStartDetected = function () {
        console.log("speechStartDetected");
        self.showToast("I'm Listening", "success");
        self.isListening = true;
        self.isComputing = false;
      };

      this.speechRecording.recognizing  = function (s, e) {
        window.console.log('recognizing ', e);
        self.validateSpeechRecording(e.result.text, false);
      };


      this.speechRecording.canceled  = function (s, e) {
        window.console.log('canceled ', e);
        self.validateSpeechRecording("cancelled speech", true);
        self.stopSpeech();
      };

      this.speechRecording.sessionStarted  = function (s, e) {
        window.console.log('sessionStarted ', e);
      };
      this.speechRecording.sessionStopped  = function (s, e) {
        window.console.log('sessionStopped ', e);
        //self.stopSpeech();
      };

      this.speechRecording.recognizeOnceAsync(
        async function (result) {
          console.log("(recognized)  Reason:" + ResultReason[result.reason]);

          switch (result.reason) {
            case ResultReason.NoMatch:
            case ResultReason.Canceled:
            await self.validateSpeechRecording(undefined, true);
              break;
            default:
            await self.validateSpeechRecording(result.text, true);
              break;
          }

          console.log("recognizeOnceAsync", result);
         
          self.stopSpeech();
        },
        function (err) {
          console.log("err recognizeOnceAsync", err);
          self.showToast("Unable to connect to the server.", "danger");
          self.stopSpeech();
          self.isQuery = false;
          self.isError = true;
          self.text = "Unable to recognized the voice. Internal error";
          self.showToast(self.text);
        }
      );
    },
    /**
     * React to speech events
     */
    listenForSpeechEvents() {
      this.greetingSpeech.onstart = () => {
        this.isTalking = true;
        this.isOnBoundary = false;
         if (this.timeout) 
          clearTimeout(this.timeout); 
          this.timeout = setTimeout(() => {
            if (!this.isOnBoundary){
              this.speech_phrases = this.text;
              this.isOnBoundary = true;
            }
          }, 600); // delay
      };

      this.greetingSpeech.onend = () => {
        this.isTalking = false;
        if (this.isQuery) {
          this.isQuery = false;
          this.listen();
        }
      };


      this.greetingSpeech.onerror = () => {
        this.isTalking = false;
        if (this.isQuery) {
          this.isQuery = false;
          this.listen();
        }
      };

      this.greetingSpeech.onboundary = (e) => {
        this.isOnBoundary = true;
        // console.log('isOnBoundary', e);
        if (e.name == "word") {
          var word = this.getWordAt(this.text, e.charIndex).toLowerCase();
          // console.log('isOnBoundary word', word);
          // console.log('this.speech_phrases word', this.speech_phrases);
          if (word != this.speech_phrases){
            this.speech_phrases += word + " ";
          }
        }
      };
    },
    async validateSpeechRecording(recordedText, isFinalResult) {
      let isSilent = recordedText == undefined ? true : false;
      // Perform type conversions.
      
      recordedText = String(
        recordedText == undefined ? "(silent)" : recordedText
      );

      if (isSilent && this.typeText.length >= 0)
      {
        this.showToast("Your response is 🤐 (silent)", "warning");

        // keep it silent
      }
      else
      {
        this.showToast("Your response is : " + recordedText, "secondary");
        // this.validateWord(recordedText);
      }
      
      if (isFinalResult)
      {
        let self = this;
        try {

          let apiType = "wordMeaning";

          if (self.selectedOperator == "synonyms") {
            apiType =  "wordSynonyms";
          }
          if (self.selectedOperator == "antonyms") {
            apiType = "wordAntonyms";
          }
          var res = await self.axiosClient.get(apiType + "?word=" + self.word + "&answer=" + recordedText)            
          
          let aiResponse = null;

          if (res != null && res.data)
          {
            aiResponse = res.data;
          }
          console.log(aiResponse);

          if (aiResponse != null && aiResponse.includes('Yes'))
            {
              self.stars++;
                localStorage.stars = self.stars;
                self.text = 
                  self.encourage_phases[
                    Math.floor(Math.random() * self.encourage_phases.length)
                  ] + "." + aiResponse + "." +
                  "You earned " +
                  self.stars +
                  " star" +
                  (self.stars == 1 ? "" : "s");
            } else {
              self.text =
              self.incorrect_phases[
                  Math.floor(Math.random() * self.incorrect_phases.length)
                ] +  aiResponse;
            }
            self.speak();
            self.isPlayMode = true;
            self.isComputing = false;
            self.isListening = false;
        } catch  (error) {
          console.error(error);
          self.isError = true;
          self.speech_phrases = "Server is unavailable.";
          self.showToast(this.speech_phrases, "danger");
        }
      }
    },
    getWordAt(str, pos) {
      // Perform type conversions.
      str = String(str);
      pos = Number(pos) >>> 0;

      // console.log('previousPosition', this.previousPosition)
      if (this.previousPosition == pos) {
        this.isTalking = false;
        return "";
      }
      this.previousPosition = pos;

      // Search for the word's beginning and end.
      var left = str.slice(0, pos + 1).search(/\S+$/),
        right = str.slice(pos).search(/\s/);
      // The last word in the string is a special case.
      if (right < 0) {
        if (!this.isQuery) {
          // this.isPlayMode = true;
        }
        this.isTalking = false;
        return str.slice(left);
      }

      // Return the word, using the located bounds to extract it from the string.
      return str.slice(left, right + pos);
    },
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
  },
  mounted() {
    var self = this;
    self.axiosClient = axios.create({
      baseURL: self.baseUrl,
      headers: {
        "Ocp-Apim-Subscription-Key":  self.openAi_apiKey,
      },
    });

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function () {
        self.isMicrophoneEnabled = true;
      })
      .catch(function () {
        console.log("No mic for you!");
      });

    this.listenForSpeechEvents();

    if (localStorage.stars) {
      this.stars = localStorage.stars;
    }


    this.axiosClient.get("speechAPI")    .then(response => {this.token = response.data;}).catch(() => {
        this.isError = true;
        this.speech_phrases = "Server is unavailable.";
        this.showToast(this.speech_phrases, "danger");
      });
  },
  setup() {
    return {
      star,
    };
  },
  created(){
    window.addEventListener('keydown', this.keyDownHandler)
  },
  unmounted() {
    window.removeEventListener('keydown', this.keyDownHandler)
  },
};
</script>