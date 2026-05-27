# example transcripts

real patient simulations used for demo validation and agent prompt tuning.

---

## transcript 1 — english, cough (3 weeks)

**language detected:** english

> **AI:** Hello! What brings you in today?
> **Patient:** Uh... I have cough. Very bad cough. Three week now. I tired all the time, nose running, I feel sick. I think maybe cold but no go away. Some day better, some day very bad. I cannot sleep good.

*AI detects: cough × 3 weeks, fatigue, rhinorrhea, disrupted sleep, intermittent pattern, gradual onset. Still needs: severity, provocation/palliation.*

> **AI:** On a scale of 1 to 10, how bad is the cough on a bad day?
> **Patient:** Maybe seven. Is hard to breathe sometime when cough a lot.

*AI detects: severity 7/10, occasional breathing difficulty during coughing episodes.*

> **AI:** Is there anything that makes the cough better or worse — like certain times of day, cold air, or lying down?
> **Patient:** Yes, night is worse. When I lay down, cough more. Morning also bad. Hot tea help little bit.

*AI detects: positional/nocturnal worsening (R↑ lying down), morning symptoms, mild palliation with warm fluids. OPQRST complete.*

**clinical flags:** 3-week duration + nocturnal pattern + symptom cluster → possible bacterial superinfection or post-nasal drip. recommend clinical assessment.

---

## transcript 2 — vietnamese/english mixed, rash (2 weeks)

**language detected:** vietnamese

> **AI:** Hello! What brings you in today?
> **Patient:** Uh... tôi bị nổi mẩn... rash? On my arm, and little bit on chest. Maybe... two week? It itchy, very itchy. Tôi gãi hoài... I scratch all the time. Sometimes it get red more, like angry. I think maybe soap or something but I change soap already, no help. Tôi không biết tại sao... I don't know why.

*AI detects: rash × 2 weeks, bilateral (arm + chest), chief symptom pruritus 8+ severity, scratch-induced worsening, soap ruled out by patient. Still needs: severity, quality, time pattern.*

> **AI:** Cảm ơn bạn — thank you for telling me. On a scale of 1 to 10, how bad is the itching?
> **Patient:** Mmm... tám? Eight. Very bad at night. Ban ngày thì bớt hơn... daytime little bit okay but night I cannot sleep.

*AI detects: severity 8/10, nocturnal worsening, disrupted sleep.*

> **AI:** Can you describe what the rash looks like — is it bumpy, flat, blistery, or does it have any color to it?
> **Patient:** It is... red, and có nốt nhỏ... like small bump. Some place it dry, peeling little bit. Không có mủ... no pus. Just dry and red and bump.

*AI detects: erythematous papular rash, dry/flaking, no pustules. OPQRST complete.*

**clinical flags:** 2-week duration, nocturnal itch, morphology (erythematous papular + dry/scaling) → consistent with atopic dermatitis or contact dermatitis. recommend clinical assessment.

---

## notes on mixed-language handling

both transcripts demonstrate the core value prop:
- patient code-switches mid-sentence (viet/english)
- AI responds in patient's dominant language
- clinical meaning extracted regardless of language mixing
- triage card rendered in english for staff

this is the demo moment: **broken speech → clean clinical output**.
