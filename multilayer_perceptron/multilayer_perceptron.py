import torch
import torch.nn.functional as F
import random

with open("../names.txt", "r") as f:
    words = f.read().splitlines()

chars = sorted(list(set("".join(words))))
s_to_i = {s: i + 1 for i, s in enumerate(chars)}
s_to_i["."] = 0
i_to_s = {i: s for s, i in s_to_i.items()}

block_size = 3


def build_dataset(words, block_size):
    X, Y = [], []
    for w in words:
        # print(w)
        context = [0] * block_size
        for ch in w + ".":
            ix = s_to_i[ch]
            X.append(context)
            Y.append(ix)
            # print("".join(i_to_s[i] for i in context), "->", i_to_s[ix])
            context = context[1:] + [ix]

    X = torch.tensor(X)
    Y = torch.tensor(Y)
    print(X.shape, Y.shape)
    return X, Y


random.shuffle(words)
n1 = int(0.8 * len(words))
n2 = int(0.9 * len(words))

Xtr, Ytr = build_dataset(words[:n1], block_size)
Xdev, Ydev = build_dataset(words[n1:n2], block_size)
Xtest, Ytest = build_dataset(words[n2:], block_size)


g = torch.Generator().manual_seed(420)
C = torch.randn((27, 10), generator=g)
W1 = torch.randn((30, 100), generator=g)
b1 = torch.randn(100, generator=g)
W2 = torch.randn((100, 27), generator=g)
b2 = torch.randn(27, generator=g)
parameters = [C, W1, b1, W2, b2]

print(f"Number of parameters: {sum(p.nelement() for p in parameters)}")

for p in parameters:
    p.requires_grad = True


# used for polotting
# lri = []
# lossi = []
# stepi = []

lr = 0.1
print("Training ...")
# for i in range(200_000):
for i in range(10_000):
    # minibach
    ix = torch.randint(0, Xtr.shape[0], (90,))

    # forward
    emb = C[Xtr[ix]]
    h = torch.tanh(emb.view(-1, 30) @ W1 + b1)
    logits = h @ W2 + b2

    # counts = logits.exp()
    # probs = counts / counts.sum(1, keepdim=True)
    # loss = -probs[torch.arange(32), Y].log().mean()
    loss = F.cross_entropy(logits, Ytr[ix])

    # backward
    for p in parameters:
        p.grad = None
    loss.backward()

    # update
    # lr = lrs[i]
    if i == 60_000:
        lr = 0.06
    for p in parameters:
        p.data -= lr * p.grad  # pyright: ignore[reportGeneralTypeIssues]

    # used for polotting
    # lri.append(lre[i])
    # lossi.append(loss.log10().item())
    # stepi.append(i)
print("...Finished")

emb = C[Xdev]
h = torch.tanh(emb.view(-1, 30) @ W1 + b1)
logits = h @ W2 + b2
loss = F.cross_entropy(logits, Ydev)
print(f"Loss for valid split {loss}")


g = torch.Generator().manual_seed(420)
for _ in range(20):
    out = []
    context = [0] * block_size  # initialize with all ...
    while True:
        emb = C[torch.tensor([context])]  # (1,block_size,d) 1, 3, 10
        h = torch.tanh(emb.view(1, -1) @ W1 + b1)
        logits = h @ W2 + b2
        probs = F.softmax(logits, dim=1)
        ix = torch.multinomial(probs, num_samples=1, generator=g).item()
        context = context[1:] + [ix]
        out.append(ix)
        if ix == 0:
            break

    print("".join(i_to_s[i] for i in out))
