#include "deragotchi.h"
#include <iostream>
#include <sstream>
#include <chrono>

using namespace std;
using namespace std::chrono;

/*aux to keep the values between 0 and 100,
it fix the case of negatives values*/
int keepVal(int value, int mn = 0, int mx = 100) {
  if (value < mn) return mn;
  if (value > mx) return mx;
  return value;
}

deragotchi::deragotchi(string name) :
  name(name), hunger(50), happiness(50),
  cleanliness(50), energy(50),
  isAlive(true), isSleeping(false) {
    lastUpd = steady_clock::now();
  }

/*feed the pet, increasing happiness and energy
also decreasing the hunger and cleanliness*/
void deragotchi::feed(){
  if (!isAlive or isSleeping) return;
  hunger = keepVal(hunger-20);
  energy = keepVal(energy+10);
  cleanliness = keepVal(cleanliness-10);
  happiness = keepVal(happiness+5);
  upd();
}

/*play with the pet increasing happinnes,
but the pet gets tired and dirty*/
void deragotchi::play(){
  if (!isAlive or isSleeping) return;
  happiness = keepVal(happiness+30);
  energy = keepVal(energy-15);
  cleanliness = keepVal(cleanliness-20);
  upd();
}

/*put the pet to sleep to recover energy*/
void deragotchi::sleep(){
  if (!isAlive or isSleeping) return;
  isSleeping = true;
  energy = keepVal(energy+40);
  upd();
}

/*bath the pet to increase their cleanliness
but they get sad because they dont like baths*/
void deragotchi::clean(){
  if (!isAlive or isSleeping) return;
  cleanliness = keepVal(cleanliness+30);
  happiness = keepVal(happiness-5);
  upd();
}

/*wake up the deragotchi after sleep*/
void deragotchi::wakeywakey(){
  if (!isAlive or !isSleeping) return;
  isSleeping = false;
  upd();
}

/*update the state of deragotchi in time,
it decreases or increase the value of
states over time*/
void deragotchi::upd(){
  auto now = steady_clock::now();
  long lapsed = duration_cast<seconds>(now-lastUpd).count();

  if (lapsed<2) return;

  if (!isSleeping) {
    hunger = keepVal(hunger+3);
    energy = keepVal(energy-2);
    cleanliness = keepVal(cleanliness-1);

    if (hunger>80) happiness = keepVal(happiness-2);
    if (cleanliness<20) happiness = keepVal(happiness-2);
  } else {
    energy = keepVal(energy+5);
    if (energy>=100) wakeywakey();
  }
  
  if (hunger>=100 or happiness<=0){
    isAlive = false;
  }
  lastUpd = now;
}

/*getter that gets the mood and state of the pet*/
string deragotchi::getmood() const {
  if (!isAlive) return "dead x.x";
  if (isSleeping) return "mimiendo";
  if (hunger>65) return "hungy";
  if (cleanliness<30) return "dirty";
  if (happiness>60) return "happy c:";
  if (happiness<30) return "sad:(";
  return "normal";
}

string deragotchi::toJSON() const {
  stringstream json;
  json << "{"
     << "\"name\":\"" << name << "\","
     << "\"hunger\":" << hunger << ","
     << "\"happiness\":" << happiness << ","
     << "\"energy\":" << energy << ","
     << "\"cleanliness\":" << cleanliness << ","
     << "\"isAlive\":" << (isAlive ? "true" : "false") << ","
     << "\"isSleeping\":" << (isSleeping ? "true" : "false") << ","
     << "\"mood\":\"" << getmood() << "\","
     << "\"age\":0"
     << "}";
  return json.str();
}
